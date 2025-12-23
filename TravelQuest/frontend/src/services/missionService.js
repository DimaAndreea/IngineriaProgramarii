// src/services/missionService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

// helper comun (similar cu ce ai în api.js)
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
    // backend not ready / endpoint missing
    if (res.status === 404) throw new Error("Missions endpoint not available yet.");

    // încearcă JSON error (Spring)
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

/**
 * GET /api/missions
 * Așteptat: listă de misiuni
 * ex item: { id, title, description, deadline, reward_points, status, scope }
 */
export function listMissions() {
  return request(`${API_BASE_URL}/api/missions`);
}

/**
 * POST /api/missions
 * (Admin only) - creează o misiune
 */
export function createMission(payload) {
  return request(`${API_BASE_URL}/api/missions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Opțional, dacă vei avea endpoint dedicat:
 * GET /api/missions/:id
 */
export function getMissionById(id) {
  return request(`${API_BASE_URL}/api/missions/${id}`);
}
