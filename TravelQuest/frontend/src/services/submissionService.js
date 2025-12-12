const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const BASE = `${API_BASE_URL}/api/itineraries`;

/**
 * GET ACTIVE ITINERARY FOR TOURIST
 */
export async function getActiveItineraryForTourist() {
  const res = await fetch(`${BASE}/active/tourist`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch active itinerary.");
  }

  return res.json();
}

/**
 * UPLOAD PHOTO SUBMISSION
 * POST /api/itineraries/{id}/submissions
 */
export async function uploadSubmission(itineraryId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/${itineraryId}/submissions`, {
    method: "POST",
    body: formData,
    credentials: "include",
    // IMPORTANT: do NOT set Content-Type manually for FormData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload submission.");
  }

  return res.json();
}
