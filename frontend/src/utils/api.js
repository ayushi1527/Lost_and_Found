// src/utils/api.js
// Use `VITE_API_URL` if provided by Vite; otherwise fall back to deployed Render URL
export const API_BASE = import.meta.env.VITE_API_URL || "https://lost-and-found-igdtuw.onrender.com/api";

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export function getAuthHeaders(contentType = "application/json") {
  const headers = {};
  const token = localStorage.getItem("token");
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
