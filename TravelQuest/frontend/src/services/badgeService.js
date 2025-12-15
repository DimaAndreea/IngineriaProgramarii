const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

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
    if (res.status === 404) throw new Error("Badges endpoint not available yet.");
    try {
      const j = JSON.parse(text);
      throw new Error(j.message || j.error || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ✅ BACKEND REAL
export function getMyBadges() {
  return request(`${API_BASE_URL}/api/profile/badges`);
}

export function selectBadge(badgeId) {
  return request(`${API_BASE_URL}/api/profile/badges/${badgeId}/select`, {
    method: "POST",
  });
}

export function clearSelectedBadge() {
  return request(`${API_BASE_URL}/api/profile/badges/selected`, {
    method: "DELETE",
  });
}

export function getSelectedBadge() {
  return request(`${API_BASE_URL}/api/profile/badges/selected`);
}

// DEV
export function devUnlockBadgesForUser(userId) {
  return request(`${API_BASE_URL}/api/dev/badges/unlock/${userId}`, {
    method: "POST",
  });
}
