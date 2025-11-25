// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/config"; // adjust path if needed

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Load user data (localStorage copy) on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Fetch profile counts & previews from backend (/api/profile)
  useEffect(() => {
    let mounted = true;
    async function loadProfileStats() {
      setLoading(true);
      setErr(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/api/profile`, {
          method: "GET",
          headers,
          // if you use cookie-based auth, include credentials; token will be used otherwise
          credentials: token ? undefined : "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message || `Failed to load profile (${res.status})`);
        }

        const data = await res.json();
        if (!mounted) return;

        setStats({
          lostCount: data.lostCount ?? 0,
          foundCount: data.foundCount ?? 0,
          returnedCount: data.returnedCount ?? 0,
          recentLost: data.recentLost ?? [],
          recentFound: data.recentFound ?? [],
        });
      } catch (error) {
        console.error("Profile load error:", error);
        if (mounted) setErr(error.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfileStats();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="my-20 text-center text-lg font-semibold">
        Please login to view your profile.
      </div>
    );
  }

  // use the API-provided stats when available, otherwise fall back to user fields (if any)
  const totalLost = stats?.lostCount ?? user.totalLost ?? 0;
  const totalFound = stats?.foundCount ?? user.totalFound ?? 0;
  const totalReturned = stats?.returnedCount ?? user.totalReturned ?? 0;
  const lostPreview = stats?.recentLost ?? user.lastLostItems ?? [];
  const foundPreview = stats?.recentFound ?? user.lastFoundItems ?? [];

  return (
    <div className="p-10 bg-themeCream flex justify-center">
      <div className="w-[900px] bg-white rounded-3xl p-10 shadow-lg space-y-10">
        {/* Header */}
        <h1 className="text-3xl font-bold text-themeGreen text-center">
          Your Profile
        </h1>

        {/* Top Section */}
        <div className="flex flex-col sm:flex-row gap-20 px-8 items-center">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 rounded-full overflow-hidden shadow">
              <img
                src="/profile.jpg"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-gray-500">Default Avatar</p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-lg">{user.name || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-themeCream p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">{totalLost}</p>
            <p className="mt-2 text-gray-600">Lost Items</p>
          </div>

          <div className="bg-themeCream p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">{totalFound}</p>
            <p className="mt-2 text-gray-600">Found Items</p>
          </div>

          <div className="bg-themeCream p-6 rounded-xl shadow">
            <p className="text-3xl font-bold">{totalReturned}</p>
            <p className="mt-2 text-gray-600">Returned</p>
          </div>
        </div>

        {/* QUICK PREVIEW SECTION */}
        <div className="space-y-10">
          {/* Lost Items Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Recently Reported Lost Items
            </h2>

            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : err ? (
              <div className="text-red-500">Error: {err}</div>
            ) : lostPreview.length > 0 ? (
              <ul className="space-y-2">
                {lostPreview.map((item, idx) => (
                  <li
                    key={item._id ?? idx}
                    className="bg-gray-100 p-3 rounded-lg shadow text-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.itemName || item.title || "Untitled"}</div>
                      <div className="text-xs text-gray-500">{item.location || ""}</div>
                    </div>
                    <div className="text-xs text-gray-500">{(item.status || "unknown").toUpperCase()}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm">No recent lost items.</p>
            )}
          </div>

          {/* Found Items Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Recently Found Items</h2>

            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : err ? (
              <div className="text-red-500">Error: {err}</div>
            ) : foundPreview.length > 0 ? (
              <ul className="space-y-2">
                {foundPreview.map((item, idx) => (
                  <li
                    key={item._id ?? idx}
                    className="bg-gray-100 p-3 rounded-lg shadow text-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.itemName || item.title || "Untitled"}</div>
                      <div className="text-xs text-gray-500">{item.location || ""}</div>
                    </div>
                    <div className="text-xs text-gray-500">{(item.status || "unknown").toUpperCase()}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm">No recent found items.</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center flex-wrap gap-4">
          <button
            onClick={() => navigate("/lost-items")}
            className="px-6 py-2 bg-themeGreen text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            View Lost Items
          </button>

          <button
            onClick={() => navigate("/found-items")}
            className="px-6 py-2 bg-themeGreen text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
          >
            View Found Items
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
