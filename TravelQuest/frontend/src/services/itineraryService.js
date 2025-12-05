// src/services/itineraryService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const ITINERARIES_BASE_URL = `${API_BASE_URL}/api/itineraries`;

// Funcție helper pentru a obține Token-ul din LocalStorage
function getAuthToken() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user.token; // Sau user.accessToken, verifică cum l-ai salvat
  } catch (e) {
    console.error("Eroare la parsarea userului din localStorage", e);
    return null;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    // Dacă primim 401/403, ar fi o idee bună să delogăm userul, dar momentan doar aruncăm eroare
    throw new Error(message || "A apărut o eroare la comunicarea cu serverul.");
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function getItineraries() {
  const token = getAuthToken();
  
  const res = await fetch(ITINERARIES_BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }) // Adaugă token doar dacă există
    }
  });
  return handleResponse(res);
}

export async function getItineraryById(id) {
  const token = getAuthToken();

  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  });
  return handleResponse(res);
}

// --- AICI ERA PROBLEMA PRINCIPALĂ ---
export async function createItinerary(data) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Nu ești autentificat! (Lipsește token-ul)");
  }

  const res = await fetch(ITINERARIES_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // <--- HEADER-UL OBLIGATORIU
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateItinerary(id, data) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Nu ești autentificat!");
  }

  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteItinerary(id) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Nu ești autentificat!");
  }

  const res = await fetch(`${ITINERARIES_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(res);
}

export async function getItinerariesForGuide(userId) {
  const token = getAuthToken();

  // De obicei endpoint-ul e /api/itineraries/mine (dacă vrei itinerariile mele) 
  // sau /api/itineraries?creatorId=... 
  // Dar las așa cum ai cerut tu path-ul:
  const res = await fetch(`${ITINERARIES_BASE_URL}/guide/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
  });
  return handleResponse(res);
}