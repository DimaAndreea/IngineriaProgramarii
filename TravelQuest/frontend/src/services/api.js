// src/api.js
import axios from "axios";
import { notifyGamificationMaybeUpdated } from "./utils/gamificationEvents";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8088",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ important pt @SessionAttribute("user")
});

// orice request mutator => după succes, semnalăm refresh gamification
api.interceptors.response.use(
  (response) => {
    try {
      const method = String(response?.config?.method || "get").toLowerCase();
      if (["post", "put", "patch", "delete"].includes(method)) {
        notifyGamificationMaybeUpdated();
      }
    } catch {}
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
