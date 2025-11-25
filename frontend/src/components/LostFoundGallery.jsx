import React, { useEffect, useState } from "react";
import api from "../utils/axios";

function LostFoundGallery() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [myItems, setMyItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [lostRes, foundRes] = await Promise.all([
          api.get("/api/items?type=lost"),
          api.get("/api/items?type=found"),
        ]);
        setLostItems(lostRes.data);
        setFoundItems(foundRes.data);

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await api.get("/api/items/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyItems(userRes.data);
        }
      } catch (error) {
        console.error("Error fetching items", error);
      }
    };
    fetchItems();
  }, []);

  const renderSection = (title, items, color) => (
    <section className="mb-10">
      <h2
        className={`text-2xl font-bold mb-4 ${
          color === "red"
            ? "text-red-600"
            : color === "green"
            ? "text-green-600"
            : "text-themeGreen"
        }`}
      >
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No items available yet.</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          {items.map((item) => (
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
                <h3 className="font-bold text-lg text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded by {item.userName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="px-4 md:px-8 py-10 bg-gray-50 min-h-screen">
      {myItems.length > 0 && renderSection("My Uploads", myItems, "green")}
      {renderSection("Lost Items", lostItems, "red")}
      {renderSection("Found Items", foundItems, "green")}
    </div>
  );
}

export default LostFoundGallery;
