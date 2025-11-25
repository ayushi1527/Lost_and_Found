import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axios";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, type } = location.state || {};
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const endpoint = type === "signup" ? "/auth/verify-signup" : "/auth/verify-login";
      const res = await api.post(endpoint, { email, otp });

      if (res.data.message) {
        alert(res.data.message);

        if (type === "signup") {
          // Signup verified → redirect to login page
          navigate("/login");
        } else {
          // Login verified → save token and redirect to dashboard
          if (res.data.token) {
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
          } else {
            // Fallback in case token is missing
            alert("Login successful, but no token received");
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="my-20 flex items-center justify-center">
      <div className="w-[500px] bg-themeCream rounded-3xl p-10 shadow-md">
        <h1 className="text-2xl font-bold text-center text-themeGreen mb-6">Verify OTP</h1>
        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-themeGreen text-themeCream font-semibold py-[10px] rounded-lg shadow-md"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
