import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    email: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleotpSent = async (e) => {
    e.preventDefault();
    const { name, enrollment, email } = formData;
    if (!name || !enrollment || !email) {
      alert("Please fill all the fields");
      return;
    }
    try {
      const res = await api.post("/auth/send-otp", { name, enrollment, email });
      if (res.data.message) {
        alert("OTP sent to email!");
        setOtpSent(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error sending OTP");
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/verify-otp", { ...formData });
      if (res.data.message) {
        alert("OTP verified! Signup successful.");
        navigate("/login");
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  //
  const handleSubmit = otpSent ? handleVerifyOtp : handleotpSent;

  return (
    <div className="my-20 flex items-center justify-center">
      <div className="flex w-[900px] bg-themeCream rounded-3xl overflow-hidden shadow-md">
        <div className="flex-1 p-10">
          <h1 className="text-2xl font-bold text-center text-themeGreen mb-6">
            Sign Up
          </h1>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={otpSent}
              className="w-full rounded-lg border px-3 py-2"
            />
            <input
              type="text"
              name="enrollment"
              placeholder="Enrollment Number"
              value={formData.enrollment}
              onChange={handleChange}
              required
              disabled={otpSent}
              className="w-full rounded-lg border px-3 py-2"
            />
            <input
              type="email"
              name="email"
              placeholder="IGDTUW Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={otpSent}
              className="w-full rounded-lg border px-3 py-2"
            />
            {otpSent && (
              <input
                type="text"
                name="otp"
                placeholder="Enter the OTP"
                value={formData.otp}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2"
              />
            )}
            <button
              type="submit"
              className="w-full bg-themeGreen text-themeCream font-semibold py-[10px] rounded-lg shadow-md"
            >
              {otpSent ? "Verify OTP" : "Send OTP"}
            </button>
          </form>
        </div>

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

export default Signup;