import User from "../models/User.js";
import Otp from "../models/Otp.js";
import sendOtp from "../utils/sendOtp.js";
import { generateToken } from "../utils/generateToken.js";

// Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup - send OTP
export const signup = async (req, res) => {
  try {
    const { name, enrollment, email } = req.body;

    if (!email.endsWith("@igdtuw.ac.in")) {
      return res.status(400).json({ error: "Use college email only" });
    }

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, enrollment, email });

    const otp = generateOTP();
    await Otp.create({ email, otp });
    const result = await sendOtp(email, otp);

    if (!result || !result.success) {
      // OTP is created in DB — return success but indicate email failed so frontend can show helpful UI
      return res.json({ message: "OTP generated", emailSent: false, error: result && result.error ? result.error : undefined });
    }

    res.json({ message: "OTP generated", emailSent: true, previewUrl: result.previewUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Signup OTP
export const verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    const user = await User.findOneAndUpdate({ email }, { verified: true }, { new: true });
    const token = generateToken(user);

    // Return a message for the signup flow to match frontend expectations
    return res.json({ message: 'Signup verified', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generic verify endpoint used by frontend at /verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

    // If user is not verified, treat as signup verification
    if (!user.verified) {
      await User.findOneAndUpdate({ email }, { verified: true });
      await Otp.deleteMany({ email });
      return res.json({ message: 'OTP verified for signup' });
    }

    // Otherwise treat as login verification and return token
    await Otp.deleteMany({ email });
    const token = generateToken(user);
    return res.json({ message: 'OTP verified for login', token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Login - send OTP
export const login = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, verified: true });
    if (!user) return res.status(400).json({ error: "User not found or not verified" });

    const otp = generateOTP();
    await Otp.create({ email, otp });
    const result = await sendOtp(email, otp);
    if (!result || !result.success) {
      return res.json({ message: "OTP generated for login", emailSent: false, error: result && result.error ? result.error : undefined });
    }

    res.json({ message: "OTP sent for login", emailSent: true, previewUrl: result.previewUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Login OTP
export const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    const user = await User.findOne({ email });
    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
