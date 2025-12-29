// src/services/missionService.js

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
    if (res.status === 404) throw new Error("Endpoint not available yet.");
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
 * Returns: array OR {data: array} OR {success, data}
 */
export async function listMissions() {
  const res = await request(`${API_BASE_URL}/api/missions`);
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? [];
}

/**
 * POST /api/missions/{id}/join
 * Returns: updated join state OR wrapper
 */
export async function joinMission(missionId) {
  try {
    const res = await request(`${API_BASE_URL}/api/missions/${missionId}/join`, {
      method: "POST",
    });
    console.log("Join success:", res);
    return res?.data ?? res;
  } catch (err) {
    console.error("Join error:", err);
    throw err;
  }
}


/**
 * Admin create (kept here because you already have it),
 * but it’s NOT required by this subtask.
 * You can keep or ignore it.
 */
export async function createMission(payload) {
  const res = await request(`${API_BASE_URL}/api/missions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}
