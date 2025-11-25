// src/utils/api.js
export const API_BASE = "https://lost-and-found-igdtuw.onrender.com/";

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
