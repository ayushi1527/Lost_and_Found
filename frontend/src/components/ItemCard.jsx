// src/components/ItemCard.jsx
import React, { useState, useEffect } from "react";
import { API_BASE } from "../utils/config";

/**
 * ItemCard
 * Props:
 *  - item: item object (may contain reportedBy string or object)
 *  - onChange: callback to refresh parent list after edits/deletes
 */
export default function ItemCard({ item, onChange }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // originalItem snapshot used to revert when cancel editing
  const [originalItemSnapshot, setOriginalItemSnapshot] = useState(null);

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    location: "",
    pointOfContact: "",
    imageUrl: "",
    reportType: item.reportType || "lost",
    status: item.status || "open",
  });
  const [uploaderName, setUploaderName] = useState(null);
  const [previewFileName, setPreviewFileName] = useState(null);

  // derive a safe reportedBy id (works if reportedBy is object or string)
  const getReportedById = (it) => {
    if (!it || it.reportedBy == null) return null;
    if (typeof it.reportedBy === "object") {
      if (it.reportedBy._id) return String(it.reportedBy._id);
      // sometimes mongoose returns id as _id or id
      if (it.reportedBy.id) return String(it.reportedBy.id);
      return String(it.reportedBy);
    }
    return String(it.reportedBy);
  };

  useEffect(() => {
    // initialize form from incoming item
    setForm({
      itemName: item.itemName || "",
      description: item.description || "",
      location: item.location || "",
      pointOfContact: item.pointOfContact || "",
      imageUrl: item.imageUrl || "",
      reportType: item.reportType || "lost",
      status: item.status || "open",
    });

    // store original snapshot for revert
    setOriginalItemSnapshot({
      itemName: item.itemName || "",
      description: item.description || "",
      location: item.location || "",
      pointOfContact: item.pointOfContact || "",
      imageUrl: item.imageUrl || "",
      reportType: item.reportType || "lost",
      status: item.status || "open",
    });

    // derive uploader name: prefer populated object name/email; else local user match; else unknown
    if (item.reportedBy && typeof item.reportedBy === "object") {
      setUploaderName(item.reportedBy.name || item.reportedBy.fullName || item.reportedBy.email || null);
    } else {
      // check local user (if user posted this item and local storage has user)
      const me = JSON.parse(localStorage.getItem("user") || "null");
      if (me && (String(me._id || me.id) === String(item.reportedBy))) {
        setUploaderName(me.name || me.fullName || me.displayName || me.email || null);
      } else {
        setUploaderName(null);
      }
    }

    setPreviewFileName(null);
  }, [item]);

  // current user id from local storage (shape depends on your auth)
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id ?? currentUser?.id ?? null;

  // compare owner reliably
  const reportedById = getReportedById(item);
  const isOwner = Boolean(currentUserId && reportedById && String(currentUserId) === String(reportedById));

  // helper that either uses token Authorization header or credentials include
  const authFetch = async (url, opts = {}) => {
    const token = localStorage.getItem("token");
    opts.headers = opts.headers || {};

    // if body is FormData we must not set content-type (browser will set boundary)
    const bodyIsFormData = opts.body instanceof FormData;

    if (token) {
      if (!bodyIsFormData && !opts.headers["Content-Type"]) {
        opts.headers["Content-Type"] = "application/json";
      }
      opts.headers["Authorization"] = `Bearer ${token}`;
    } else {
      // fallback to cookies (if your app uses cookies)
      opts.credentials = opts.credentials ?? "include";
      if (!bodyIsFormData && opts.body && typeof opts.body === "object" && !opts.headers["Content-Type"]) {
        opts.headers["Content-Type"] = "application/json";
      }
    }

    // stringify JSON body if needed
    if (opts.body && typeof opts.body === "object" && !bodyIsFormData && opts.headers["Content-Type"] === "application/json") {
      opts.body = JSON.stringify(opts.body);
    }

    return fetch(url, opts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // file -> base64 helper
  const fileToDataUrl = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  // handle file picked in edit form
  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((p) => ({ ...p, imageUrl: dataUrl }));
      setPreviewFileName(file.name);
    } catch (err) {
      console.error(err);
      alert("Failed to read file");
    }
  };

  // Save changes (PATCH)
  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/items/${item._id}`, {
        method: "PATCH",
        body: {
          itemName: form.itemName,
          description: form.description,
          location: form.location,
          pointOfContact: form.pointOfContact,
          imageUrl: form.imageUrl,
          reportType: form.reportType,
          status: form.status,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to update" }));
        alert(err.message || "Failed to update");
        return;
      }

      // Optionally read updated item from response
      try {
        const data = await res.json();
        // if backend returns updated item, you may use it or just refresh parent
        // we call onChange to refresh the parent list
      } catch (e) {
        // if no JSON, ignore
      }

      onChange?.();
      setEditing(false);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Update failed. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await authFetch(`${API_BASE}/api/items/${item._id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Delete failed" }));
        alert(err.message || "Delete failed");
        return;
      }
      onChange?.();
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const markAction = async (action) => {
    try {
      const res = await authFetch(`${API_BASE}/api/items/${item._id}/mark`, {
        method: "POST",
        body: { action },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Action failed" }));
        alert(err.message || "Action failed");
        return;
      }
      onChange?.();
    } catch (e) {
      console.error(e);
      alert("Action failed");
    }
  };

  const statusBadge = (s) => {
  const status = (s || "reported").toLowerCase();

  const map = {
    reported: { label: "Reported", cls: "bg-gray-200 text-gray-800" },
    found:    { label: "Found", cls: "bg-green-200 text-green-800" },
    handed:   { label: "Handed", cls: "bg-indigo-200 text-indigo-800" },
  };

  const meta = map[status] || map.reported;
  return <span className={`text-xs px-2 py-1 rounded ${meta.cls}`}>{meta.label}</span>;
};


  // revert edits when cancel
  const cancelEdit = () => {
    if (originalItemSnapshot) {
      setForm({ ...originalItemSnapshot });
    }
    setPreviewFileName(null);
    setEditing(false);
  };

  return (
    <>
      {/* Compact card */}
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden w-64 cursor-pointer"
        onClick={() => {
          setOpen(true);
          // ensure editing is off when opening fresh
          setEditing(false);
          // reset form from item when opening
          setForm({
            itemName: item.itemName || "",
            description: item.description || "",
            location: item.location || "",
            pointOfContact: item.pointOfContact || "",
            imageUrl: item.imageUrl || "",
            reportType: item.reportType || "lost",
            status: item.status || "open",
          });
        }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.itemName} className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
            No image
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-800">{item.itemName}</h3>
            {statusBadge(item.status)}
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            Uploaded by: {uploaderName ?? item.reportedBy?.name ?? item.reportedBy?.email ?? item.reportedBy ?? "Unknown"}
          </p>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setOpen(false);
              setEditing(false);
              // revert any edits when clicking outside
              cancelEdit();
            }}
          />

          <div className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg flex flex-col max-h-[90vh]">
            <div className="p-6 overflow-auto">
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase opacity-60">{item.reportType}</div>
                      <h2 className="text-2xl font-semibold mt-1">{item.itemName}</h2>
                      <div className="mt-2">{statusBadge(item.status)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Posted:</div>
                      <div className="text-sm text-gray-700">{new Date(item.datePosted).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700">
                    <div className="mb-2"><strong>Location:</strong> {item.location || "—"}</div>
                    <div className="mb-2"><strong>Contact:</strong> {item.pointOfContact || "—"}</div>
                    <div className="mb-2"><strong>Description:</strong></div>
                    <div className="text-gray-600 whitespace-pre-wrap">{item.description || "—"}</div>
                  </div>
                </div>
                {/* Uploader info */}
<div className="mt-4 text-sm text-gray-700">
  <div className="mb-2">
    <strong>Reported by:</strong>{" "}
    {item.reportedBy?.name || item.reportedBy?.email || item.reportedBy || "Unknown"}
  </div>

  {item.reportedBy?.email && (
    <div className="mb-2">
      <strong>Email:</strong>{" "}
      <a
        href={`mailto:${item.reportedBy.email}`}
        className="text-themeGreen underline"
        onClick={(e) => e.stopPropagation()}
      >
        {item.reportedBy.email}
      </a>
    </div>
  )}
</div>


                <div className="w-56 shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName} className="w-full h-64 object-contain rounded" />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image</div>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editing && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold mb-3">Edit item</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <input name="itemName" value={form.itemName} onChange={handleChange} className="border p-2 rounded" placeholder="Item name" />
                    <input name="location" value={form.location} onChange={handleChange} className="border p-2 rounded" placeholder="Location" />
                    <input name="pointOfContact" value={form.pointOfContact} onChange={handleChange} className="border p-2 rounded" placeholder="Point of contact" />
                    <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded" rows={4} placeholder="Description" />

                    <div>
                      <div className="text-sm font-medium mb-1">Image</div>

                      {/* preview */}
                      <div className="mb-2">
                        {form.imageUrl ? (
                          <img src={form.imageUrl} alt="preview" className="w-48 h-48 object-contain rounded border" />
                        ) : (
                          <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No image</div>
                        )}
                      </div>

                      {/* file input */}
                      <input type="file" accept="image/*" onChange={handleFilePicked} className="mb-2" />
                      {previewFileName && <div className="text-xs text-gray-600 mb-2">Selected: {previewFileName}</div>}

                      {/* optional manual URL editor (small) */}
                      <div className="text-xs text-gray-600 mb-1">Or paste image URL:</div>
                      <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="border p-2 rounded w-full" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between gap-3">
              <div className="text-xs text-gray-600">Status: {statusBadge(item.status)}</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(false);
                    cancelEdit();
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Close
                </button>

{!editing && isOwner && (
  <>
    <button
      onClick={() => setEditing(true)}
      className="px-4 py-2 bg-yellow-400 rounded"
    >
      Edit
    </button>

    <button
      onClick={deleteItem}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Delete
    </button>

    {/* For LOST items → allow "Mark Found" */}
    {item.reportType === "lost" && item.status !== "found" && (
      <button
        onClick={() => markAction("found")}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Mark Found
      </button>
    )}

    {/* For FOUND items → allow "Mark Handed" */}
    {item.reportType === "found" && item.status !== "handed" && (
      <button
        onClick={() => markAction("handed")}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Mark Handed
      </button>
    )}

    {/* NEW: Mark back to REPORTED */}
    {item.status !== "reported" && (
      <button
        onClick={() => markAction("reported")}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
      >
        Mark Reported
      </button>
    )}
  </>
)}

                {/* Editing footer buttons */}
                {editing && (
                  <>
                    <button onClick={() => cancelEdit()} className="px-4 py-2 border rounded">Cancel</button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
