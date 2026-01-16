// src/services/gamificationService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      throw new Error(j.message || j.error || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  return text ? JSON.parse(text) : null;
}

export async function getGamificationSummary() {
  return request(`${API_BASE_URL}/api/profile/gamification/summary`);
}
