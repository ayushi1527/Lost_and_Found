import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // STEP 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email });

      if (res.data.message) {
        alert("OTP sent to your email!");
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error sending OTP");
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      const res = await api.post("/auth/verify-otp", { email, otp });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        alert("OTP verified! Login successful.");
        // Redirect to home page after successful login
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    }
  };

  // Dynamically decide the submit function
  const handleSubmit = otpSent ? handleVerifyOtp : handleSendOtp;

  return (
    <div className="my-20 flex items-center justify-center">
      <div className="flex w-[900px] bg-themeCream rounded-3xl overflow-hidden shadow-md">
        {/* Left Form */}
        <div className="flex-1 p-10 flex flex-col justify-center min-h-full">
          <h1 className="text-2xl font-bold text-center text-themeGreen mb-6">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="IGDTUW Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent}
              className="w-full rounded-lg border px-3 py-2"
            />

            {otpSent && (
              <input
                type="text"
                placeholder="Enter the OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            )}

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              className="w-full bg-themeGreen text-themeCream font-semibold py-[10px] rounded-lg shadow-md"
            >
              {otpSent ? "Verify OTP & Login" : "Send OTP"}
            </button>
          </form>

          {!otpSent && (
            <p className="text-sm text-center mt-5">
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="text-themeGreen font-medium hover:underline"
              >
                Sign Up
              </a>
            </p>
          )}
        </div>

        {/* Right Logo */}
        <div className="flex-1 flex items-center justify-center p-10">
          <img
            src="/logoWithname.png"
            alt="Logo"
            className="max-w-[250px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
