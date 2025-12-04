// src/services/itineraryService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
// TODO: când ai backend-ul, verifică exact calea (ex: /api/itineraries)
const ITINERARIES_BASE_URL = `${API_BASE_URL}/api/itineraries`;

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "A apărut o eroare la comunicarea cu serverul.");
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function getItineraries() {
  const res = await fetch(ITINERARIES_BASE_URL, {
    credentials: "include", // dacă folosiți cookie-uri pentru auth
  });
  return handleResponse(res);
}

export async function getItineraryById(id) {
  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function createItinerary(data) {
  const res = await fetch(ITINERARIES_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateItinerary(id, data) {
  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    method: "PUT", // sau PATCH, verifică în backend
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteItinerary(id) {
  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function getItinerariesForGuide(userId) {
  const res = await fetch(`${ITINERARIES_BASE_URL}/guide/${userId}`);
  return handleResponse(res);
}
