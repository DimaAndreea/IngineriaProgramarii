// src/services/gamificationService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 404) throw new Error("Gamification endpoint not available yet.");
    try {
      const j = JSON.parse(text);
      throw new Error(j.message || j.error || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;

  return text ? JSON.parse(text) : null;
}

export async function getGamificationSummary() {
  const res = await request(`${API_BASE_URL}/api/gamification-summary`);
  return res?.data ?? res;
}
