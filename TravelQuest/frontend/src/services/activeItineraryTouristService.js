const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

const BASE = `${API_BASE_URL}/api/itineraries`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return res.json();
}

export function getActiveItineraryForTourist() {
  return request(`${BASE}/active/tourist`);
}
