const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const BASE = `${API_BASE_URL}/api/itineraries`;

/* =========================
   TOURIST ENROLLMENTS (FRONTEND-ONLY)
   - salvăm id-urile itinerariilor la care turistul a dat Join
   - folosit pentru pagina Profile Tourist (fără backend)
========================= */
const ENROLLMENTS_KEY = "tourist_enrollments_v1";

function readEnrollments() {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeEnrollments(list) {
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(list));
}

function addEnrollmentLocal(itineraryId) {
  const id = Number(itineraryId);
  const list = readEnrollments().map(Number);
  if (!list.includes(id)) {
    writeEnrollments([...list, id]);
  }
}

// (opțional) dacă vrei să expui utilitarele:
export function getLocalEnrollments() {
  return readEnrollments().map(Number);
}
export function clearLocalEnrollments() {
  localStorage.removeItem(ENROLLMENTS_KEY);
}

export function addLocalEnrollment(itineraryId) {
  addEnrollmentLocal(itineraryId);
}

/* =========================
   REQUEST HELPER
========================= */
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

/* =========================
   ITINERARIES
========================= */
export function getPendingItineraries() {
  return request(`${BASE}/pending`);
}

export function approveItinerary(id) {
  return request(`${BASE}/${id}/approve`, {
    method: "PATCH",
    credentials: "include",
  });
}

export function rejectItinerary(id) {
  return request(`${BASE}/${id}/reject`, {
    method: "PATCH",
    credentials: "include",
  });
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

// used for admin
export function getAllItineraries() {
  return request(BASE);
}

export function filterItineraries(filter, userId) {
  return request(`${BASE}/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      userId: userId != null ? String(userId) : "",
    },
    body: JSON.stringify(filter),
  });
}

/* =========================
   JOIN (TOURIST)
========================= */
export async function joinItinerary(id) {
  const result = await request(`${BASE}/${id}/join`, {
    method: "POST",
  });

  // ✅ salvăm în “istoricul înscrierilor” (frontend-only)
  addEnrollmentLocal(id);

  return result;
}

/* =========================
   ACTIVE ITINERARY (GUIDE)
========================= */
export function getActiveItinerariesForGuide() {
  return request(`${BASE}/active/guide`);
}

export function updateSubmissionStatus(itineraryId, submissionId, status) {
  return request(`${BASE}/${itineraryId}/submissions/${submissionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getMyItineraries(userId) {
  return getGuideItineraries(userId);
}

export function getSubmissionsForGuide(itineraryId) {
  return request(`${BASE}/${itineraryId}/submissions`);
}

/* =========================
   ACTIVE ITINERARY (TOURIST)
========================= */
export function getActiveItineraryForTourist() {
  return request(`${BASE}/active/tourist`);
}

/* =========================
   GUIDE REVIEWS
========================= */
export function getGuideReviews(guideId) {
  return request(`${API_BASE_URL}/api/guides/${guideId}/reviews`);
}

export function getGuideRating(guideId) {
  return request(`${API_BASE_URL}/api/guides/${guideId}/rating`);
}
