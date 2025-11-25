import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  enrollment: String,
  email: { type: String, unique: true },
  verified: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
