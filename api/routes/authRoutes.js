import express from "express";
import { signup, verifySignup, login, verifyLogin, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

// Backwards-compatible routes used by frontend
router.post("/send-otp", signup); // Signup flow (frontend calls /auth/send-otp)
router.post("/signup", signup);
router.post("/verify-signup", verifySignup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/verify-login", verifyLogin);

export default router;
