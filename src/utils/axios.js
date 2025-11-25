import axios from "axios";

const api = axios.create({
  baseURL: "https://lost-and-found-igdtuw.onrender.com/api",
  withCredentials: true,
});


// Attach Authorization header if token is present in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore (e.g. SSR or storage not available)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
