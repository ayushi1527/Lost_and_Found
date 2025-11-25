// src/components/RecentGallery.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/axios";

function RecentGallery() {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get("/api/items/recent"); // endpoint should return mixed recent items
        setRecentItems(res.data);
      } catch (error) {
        console.error("Error fetching recent items:", error);
      }
    };
    fetchRecent();
  }, []);

  return (
    <section className="px-6 md:px-12 py-10 bg-[#fffdf5]">
      <h2 className="text-2xl font-bold text-themeGreen mb-6">
        🔍 Recent Uploads
      </h2>

      {recentItems.length === 0 ? (
        <p className="text-gray-500">No recent uploads yet.</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          {recentItems.map((item) => (
            <div
              key={item._id}
              className="min-w-[250px] bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-48 w-full object-cover rounded-t-xl"
              />
              <div className="p-3 text-center">
                <h3 className="font-semibold text-lg text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    item.type === "lost"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.type === "lost" ? "Lost" : "Found"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentGallery;
