const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
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

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Request failed");
  }

  if (!contentType || !contentType.includes("application/json")) {
    return await res.text(); // mesaj simplu de succes
  }

  return res.json();
}

// ======================
// CRUD FUNCTIONS
// ======================
export function getPendingItineraries() {
  return request(`${BASE}/pending`);
}

export function getItineraryById(id) {
  return request(`${BASE}/${id}`);
}

export function createItinerary(data) {
  return request(BASE, { method: "POST", body: JSON.stringify(data) });
}

export function updateItinerary(id, data) {
  return request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteItinerary(id) {
  return request(`${BASE}/${id}`, { method: "DELETE" });
}

export function joinItinerary(id) {
  return request(`${BASE}/${id}/join`, { method: "POST" });
}

// ======================
// FILTER FUNCTION
// ======================
export function filterItineraries(filter, userId) {
  return request(`${BASE}/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      userId: userId,
    },
    body: JSON.stringify(filter),
  });
}

// ======================
// ACTIVE ITINERARY FUNCTIONS
// ======================
export function getActiveItinerariesForGuide() {
  return request(`${BASE}/active`);
}

export function getActiveItineraryForTourist() {
  return request(`${BASE}/active/tourist`);
}

export function updateSubmissionStatus(itineraryId, submissionId, status) {
  return request(`${BASE}/${itineraryId}/submissions/${submissionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function uploadSubmission(itineraryId, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("itineraryId", itineraryId);

  return fetch(`${BASE}/submissions`, {
    method: "POST",
    body: formData,
    credentials: "include",
  }).then(async res => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to upload submission.");
    }
    return res.json();
  });
}


// ======================
// ADMIN ACTIONS
// ======================
export function approveItinerary(id) {
  return request(`${BASE}/${id}/approve`, { method: "PATCH" });
}

export function rejectItinerary(id) {
  return request(`${BASE}/${id}/reject`, { method: "PATCH" });
}

// ======================
// OPTIONAL GETTERS
// ======================
export function getAllItineraries() {
  return request(BASE);
}

export function getGuideItineraries(guideId) {
  return request(`${BASE}/guide/${guideId}`);
}

export function getPublicItineraries() {
  return request(`${BASE}/public`);
}
