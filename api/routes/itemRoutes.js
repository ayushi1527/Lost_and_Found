// server/routes/itemRoutes.js
import express from "express";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";

const router = express.Router();

function sortByDateDesc() {
  return { datePosted: -1, createdAt: -1 };
}

/**
 * Return a string user-id from an item.reportedBy value.
 * Works when reportedBy is:
 * - an ObjectId-like value
 * - a string id
 * - a populated object like { _id, name, email }
 */
function ownerIdString(item) {
  if (!item) return null;
  const rb = item.reportedBy;
  if (rb == null) return null;

  // populated user object
  if (typeof rb === "object") {
    if (rb._id) return String(rb._id);
    try {
      return String(rb);
    } catch (e) {
      return null;
    }
  }
  // string or ObjectId-like already
  return String(rb);
}

/**
 * Get canonical user id string from req.user (works for common shapes)
 */
function getReqUserId(req) {
  if (!req) return null;
  if (req.user == null) return null;
  return String(req.user?.id || req.user?._id || req.user?.userId || "");
}

/**
 * GET /api/items
 * Public list with search + pagination
 */
router.get("/", async (req, res) => {
  try {
    const { type, q = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * perPage;

    const filter = {};
    if (type === "lost" || type === "found") filter.reportType = type;

    if (q && q.trim()) {
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      filter.$or = [
        { itemName: re },
        { description: re },
        { pointOfContact: re },
        { location: re },
      ];
    }

    const [total, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .sort(sortByDateDesc())
        .skip(skip)
        .limit(perPage)
        .populate("reportedBy", "name email")
        .lean(),
    ]);

    res.json({ page: pageNum, limit: perPage, total, items });
  } catch (err) {
    console.error("GET /api/items error:", err);
    res.status(500).json({ message: "Server error while fetching items", error: err.message });
  }
});

/**
 * POST /api/items/report
 * Protected - create a lost/found report
 */
router.post("/report", auth, async (req, res) => {
  try {
    const { itemName, description, location, pointOfContact, imageUrl, reportType } = req.body;
    if (!itemName || !description || !location || !pointOfContact || !reportType) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    if (reportType === "found" && !imageUrl) {
      return res.status(400).json({ message: "Image is required for found items" });
    }

    // If imageUrl is a base64 data URL, validate size and content
    if (typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
      // estimate size from base64 length: (4/3)*bytes, so bytes ~= (length * 3) / 4
      const base64Part = imageUrl.split(",")[1] || "";
      const approxBytes = Math.floor((base64Part.length * 3) / 4);
      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (approxBytes > maxBytes) {
        console.warn(`Rejected upload: base64 image too large (${approxBytes} bytes)`);
        return res.status(413).json({ message: "Image too large. Please upload an image smaller than 5MB or use an external image host." });
      }
    }

    const newItem = new Item({
      itemName,
      description,
      location,
      pointOfContact,
      imageUrl: imageUrl || "",
      reportType,
      reportedBy: getReqUserId(req), // store user's id
    });

    await newItem.save();
    await newItem.populate("reportedBy", "name email");

    res.status(201).json({ message: "Item reported successfully", item: newItem });
  } catch (err) {
    console.error("POST /api/items/report error:", err);
    res.status(500).json({ message: "Server error while reporting item", error: err.message });
  }
});

/**
 * GET /api/items/mine
 * Protected - items created by current user
 */
router.get("/mine", auth, async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20, type } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * perPage;

    const userId = getReqUserId(req);
    const filter = { reportedBy: userId };
    if (type === "lost" || type === "found") filter.reportType = type;
    if (q && q.trim()) {
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(safe, "i");
      filter.$or = [{ itemName: re }, { description: re }, { location: re }, { pointOfContact: re }];
    }

    const [total, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .sort(sortByDateDesc())
        .skip(skip)
        .limit(perPage)
        .populate("reportedBy", "name email")
        .lean(),
    ]);

    res.json({ page: pageNum, limit: perPage, total, items });
  } catch (err) {
    console.error("GET /api/items/mine error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/items/:id
 * Public - get a single item (populated). Placed after the above specific routes.
 */
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name email").lean();
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (err) {
    console.error("GET /api/items/:id error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/items/:id
 * Protected - edit item (owner only)
 */
router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const ownerId = ownerIdString(item);
    const reqUserId = getReqUserId(req);
    if (!reqUserId || ownerId !== reqUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowed = ["itemName", "description", "location", "pointOfContact", "imageUrl", "reportType", "status"];
    allowed.forEach((k) => {
      if (typeof updates[k] !== "undefined") item[k] = updates[k];
    });

    await item.save();
    await item.populate("reportedBy", "name email");

    res.json({ message: "Item updated", item });
  } catch (err) {
    console.error("PATCH /api/items/:id error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE /api/items/:id
 * Protected - delete item (owner only)
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const ownerId = ownerIdString(item);
    const reqUserId = getReqUserId(req);
    if (!reqUserId || ownerId !== reqUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Item.deleteOne({ _id: req.params.id });
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * POST /api/items/:id/mark
 * Protected - owner only. Body: { action: "found"|"handed"|"open"|"removed" }
 */// POST /api/items/:id/mark
router.post("/:id/mark", auth, async (req, res) => {
  try {
    const { action } = req.body;
    if (!action || typeof action !== "string") {
      return res.status(400).json({ message: "Missing action" });
    }
    const normalizedAction = action.trim().toLowerCase();

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // owner check (works whether reportedBy is populated or just an ObjectId)
    const ownerId = ownerIdString(item);
    const reqUserId = String(req.user?.id ?? req.user?._id ?? req.user);
    if (!reqUserId || ownerId !== reqUserId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Allowed actions depend on the reportType
    let allowedActions = [];
    if (item.reportType === "lost") {
      // lost items: can be set back to reported, or marked found
      allowedActions = ["reported", "found"];
    } else if (item.reportType === "found") {
      // found items: can be set back to reported, or marked handed (owner gave it to owner)
      allowedActions = ["reported", "handed"];
    } else {
      // fallback: only allow reported
      allowedActions = ["reported"];
    }

    if (!allowedActions.includes(normalizedAction)) {
      return res.status(400).json({
        message: `Unknown or disallowed action for this item. Allowed: ${allowedActions.join(
          ", "
        )}`,
      });
    }

    // apply change
    item.status = normalizedAction;
    await item.save();
    await item.populate("reportedBy", "name email");

    res.json({ message: "Item status updated", item });
  } catch (err) {
    console.error("POST /api/items/:id/mark error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
