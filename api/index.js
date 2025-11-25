import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();

// ⭐ FIXED CORS for Vercel Functions
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://lostandfoundigdtuw.netlify.app",
      "https://lost-and-found-igdtuw.onrender.com"
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ⭐ Body limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ⭐ Connect DB
connectDB();

// ⭐ IMPORTANT: REMOVE /api prefix here
// Vercel already mounts this function at /api
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/profile", profileRoutes);

// ❌ NO app.listen() on Vercel serverless
// ❌ NO PORT

export default app;