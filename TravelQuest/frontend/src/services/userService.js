// Returnează toți ghizii (publici)
export function getAllGuides() {
  return request(`${API_BASE_URL}/api/profile/guides/all`);
}
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
    // endpoint missing (backend not ready)
    if (res.status === 404) throw new Error("Profile info not available yet.");

    // încearcă să scoți un mesaj din JSON (Spring 404/500 etc.)
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

// ✅ recomandat de backend: user din sesiune
export function getMyProfile() {
  return request(`${API_BASE_URL}/api/profile/me`);
}

export function getGuideProfile(id) {
  return request(`${API_BASE_URL}/api/profile/guides/${id}`);
}

export function getTouristProfile(id) {
  return request(`${API_BASE_URL}/api/profile/tourists/${id}`);
}
