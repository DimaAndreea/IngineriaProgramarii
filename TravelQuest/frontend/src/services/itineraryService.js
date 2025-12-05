const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const BASE = `${API_BASE_URL}/api/itineraries`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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

export function getPendingItineraries() {
  return request(`${BASE}/pending`);
}

export function approveItinerary(id) {
  return request(`${BASE}/${id}/approve`, { method: "PATCH" });
}

export function rejectItinerary(id) {
  return request(`${BASE}/${id}/reject`, { method: "PATCH" });
}

export function createItinerary(data) {
  return request(BASE, { method: "POST", body: JSON.stringify(data) });
}

export function updateItinerary(id, data) {
  return request(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteItinerary(id) {
  return request(`${BASE}/${id}`, { method: "DELETE" });
}

export function getGuideItineraries(id) {
  return request(`${BASE}/guide/${id}`);
}

export function getPublicItineraries() {
  return request(`${BASE}/public`);
}

export function getItineraryById(id) {
  return request(`${BASE}/${id}`);
}
