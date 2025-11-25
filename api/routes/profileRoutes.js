// server/routes/profileRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import Item from "../models/Item.js";

const router = express.Router();

/**
 * GET /api/profile
 * Protected route.
 * Returns counts for lost/found/returned and recent items (small summaries).
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);

    // counts
    const [lostCount, foundCount, returnedCount] = await Promise.all([
      Item.countDocuments({ reportedBy: userId, reportType: "lost" }),
      Item.countDocuments({ reportedBy: userId, reportType: "found" }),
      Item.countDocuments({ reportedBy: userId, status: "handed" }), // "handed" == returned
    ]);

    // recent items (limit 5 each), return lightweight objects for UI
    const recentLost = await Item.find({ reportedBy: userId, reportType: "lost" })
      .sort({ datePosted: -1, createdAt: -1 })
      .limit(5)
      .select("_id itemName description location pointOfContact imageUrl reportType status datePosted")
      .lean();

    const recentFound = await Item.find({ reportedBy: userId, reportType: "found" })
      .sort({ datePosted: -1, createdAt: -1 })
      .limit(5)
      .select("_id itemName description location pointOfContact imageUrl reportType status datePosted")
      .lean();

    return res.json({
      lostCount,
      foundCount,
      returnedCount,
      recentLost,
      recentFound,
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
