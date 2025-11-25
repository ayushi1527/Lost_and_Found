// server/models/Item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  pointOfContact: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  reportType: { type: String, enum: ["lost", "found"], required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // NEW status field
  status: {
    type: String,
    enum: ["found", "handed", "reported"],
    default: "reported"
  },
  datePosted: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
