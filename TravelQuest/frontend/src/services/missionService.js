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

export async function listMissions() {
  const res = await request(`${API_BASE_URL}/api/missions`);
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? [];
}

export async function joinMission(missionId) {
  const res = await request(`${API_BASE_URL}/api/missions/${missionId}/join`, {
    method: "POST",
  });
  return res?.data ?? res;
}

export async function claimMission(missionId) {
  const res = await request(`${API_BASE_URL}/api/missions/${missionId}/claim`, {
    method: "POST",
  });
  return res?.data ?? res;
}

export async function createMission(payload) {
  const res = await request(`${API_BASE_URL}/api/missions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

/**
 * OPTIONAL endpoint (safe)
 * GET /api/missions/my-rewards
 */
export async function listMyRewards() {
  const res = await request(`${API_BASE_URL}/api/missions/my-rewards`);
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? [];
}

/**
 * OPTIONAL metadata endpoint (safe)
 * GET /api/missions/meta
 */
export async function getMissionMeta() {
  const res = await request(`${API_BASE_URL}/api/missions/meta`);
  return res?.data ?? res;
}
