const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const BASE = `${API_BASE_URL}/api/itineraries`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",   // 🔥 OBLIGATORIU
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}


export function createItinerary(data) {
  return request(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateItinerary(id, data) {
  return request(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteItinerary(id) {
  return request(`${BASE}/${id}`, {
    method: "DELETE",
  });
}

export function getGuideItineraries(id) {
  return request(`${BASE}/guide/${id}`);
}

export function getPublicItineraries() {
  return request(`${BASE}/public`);
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
