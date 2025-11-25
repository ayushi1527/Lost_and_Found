// src/components/ItemsList.jsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/config";
import ItemCard from "./ItemCard";

/**
 * Props:
 * - fixedType: optional "lost" or "found" to filter this list
 */
export default function ItemsList({ fixedType }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [mineOnly, setMineOnly] = useState(false);

  // NEW: statusFilter - "" means no filtering, otherwise "found" or "handed" etc.
  const [statusFilter, setStatusFilter] = useState("");

  // detect current user for owner controls (ItemCard also checks)
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id ?? currentUser?.id ?? null;

  // debounce search -> reset page
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, mineOnly, statusFilter]); // reset page if status filter toggles too

  // loader function
  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fixedType) params.set("type", fixedType);
      if (q?.trim()) params.set("q", q.trim());
      params.set("page", String(page));
      params.set("limit", String(limit));

      let url = `${API_BASE}/api/items?${params.toString()}`;
      let opts = { credentials: "include" };

      // if mineOnly, use /api/items/mine and include token if present
      if (mineOnly) {
        url = `${API_BASE}/api/items/mine?${params.toString()}`;
        const token = localStorage.getItem("token");
        if (token) {
          opts = { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } };
        } else {
          opts = { credentials: "include" };
        }
      }

      const res = await fetch(url, opts);
      if (!res.ok) {
        if (res.status === 401) {
          alert("Please login to view.");
        } else {
          console.error("Fetch failed", res.status);
        }
        setItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      const data = await res.json();

      // Client-side status filtering (so we do NOT mess with search input)
      // Ensure default status is "reported" if item.status is missing
      const allItems = (data.items || []).map(it => ({ ...it, status: it.status || "reported" }));

      const filtered = statusFilter ? allItems.filter(it => it.status === statusFilter) : allItems;

      setItems(filtered);
      // Note: total remains the server total (unfiltered). If you want total to reflect filtered list, setTotal(filtered.length)
      // We'll set total to filtered length so pagination makes sense for the filtered view:
      setTotal(filtered.length);
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedType, q, page, limit, mineOnly, statusFilter]);

  const refresh = () => load();

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {fixedType === "lost" ? "Lost Items" : fixedType === "found" ? "Found Items" : "Items"}
        </h1>

        <div className="flex items-center gap-3">
          {/* link to your report forms (adjust routes if different) */}
          <a href={fixedType === "lost" ? "/lost" : "/found"} className="px-4 py-2 bg-themeGreen text-white rounded">
            Report {fixedType === "lost" ? "Lost" : "Found"} Item
          </a>

          <button onClick={() => setMineOnly(m => !m)} className={`px-3 py-1 border rounded ${mineOnly ? "bg-gray-100" : ""}`}>
            {mineOnly ? "Showing: My Posts" : "Show My Posts"}
          </button>

          {/* NEW: Status filter buttons (do not change search input) */}
          {fixedType === "lost" && (
            <button
              onClick={() => { setStatusFilter(prev => (prev === "found" ? "" : "found")); setPage(1); }}
              className={`px-3 py-1 border rounded ${statusFilter === "found" ? "bg-gray-100" : ""}`}
            >
              {statusFilter === "found" ? "Showing: Found" : "Items Found"}
            </button>
          )}

          {fixedType === "found" && (
            <button
              onClick={() => { setStatusFilter(prev => (prev === "handed" ? "" : "handed")); setPage(1); }}
              className={`px-3 py-1 border rounded ${statusFilter === "handed" ? "bg-gray-100" : ""}`}
            >
              {statusFilter === "handed" ? "Showing: Handed" : "Items Handed"}
            </button>
          )}
{/* Show All (clears status filter and returns to full list) */}
{fixedType && (
  <button
onClick={() => { setStatusFilter(""); setQ(""); setMineOnly(false); setPage(1); }}
    className="px-3 py-1 border rounded"
    title={`Show all ${fixedType === "lost" ? "lost" : "found"} items`}
  >
    Show All
  </button>
)}

         
        </div>
      </div>

      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${fixedType ?? "items"} (item name, description)...`}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {loading ? <p>Loading…</p> : null}
      {!loading && items.length === 0 && <p className="text-center py-8">No items found.</p>}

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <li key={it._id} className="p-1">
            <ItemCard item={it} onChange={refresh} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-6 justify-center">
          <button className="border rounded px-3 py-1" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <div>Page {page} of {totalPages}</div>
          <button className="border rounded px-3 py-1" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
