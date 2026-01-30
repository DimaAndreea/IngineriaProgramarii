const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const KEY = "tq_wallet_v1";

// Helper pentru request-uri
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

// LocalStorage fallback (pentru când backend nu e disponibil)
function safeParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

function readAll() {
  return safeParse(localStorage.getItem(KEY) || "{}", {});
}

function writeAll(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

function getUserKey({ userId, username }) {
  return String(userId || username || "guest");
}

// ==================== API CALLS (pentru backend) ====================

/**
 * Obține balanța portofelului de la backend
 * Fallback la localStorage dacă backend nu răspunde
 */
export async function getWalletBalance() {
  const data = await request(`${API_BASE_URL}/api/profile/wallet`);
  return Number(data?.balanceRon || 0);
}

/**
 * Adaugă fonduri în portofel (simulat - doar introduci suma)
 */
export async function addFunds(auth, amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid amount");
  }

  const data = await request(`${API_BASE_URL}/api/profile/wallet/topup`, {
    method: "POST",
    body: JSON.stringify({ amountRon: value }),
  });
  return Number(data?.balanceRon || 0);
}

/**
 * Verifică dacă utilizatorul are fonduri suficiente
 */
export async function canAfford(cost) {
  const balance = await getWalletBalance();
  return balance >= Number(cost || 0);
}

/**
 * Efectuează plata pentru un itinerariu
 */
export async function purchaseItinerary(itineraryId, cost) {
  const c = Number(cost || 0);
  if (!Number.isFinite(c) || c < 0) {
    throw new Error("Invalid cost");
  }

  try {
    const data = await request(`${API_BASE_URL}/api/itineraries/${itineraryId}/buy`, {
      method: "POST",
    });
    return {
      success: true,
      balance: Number(data?.newBalanceRon ?? data?.balanceRon ?? 0),
      message: data?.message || "Payment successful!",
    };
  } catch (err) {
    // Verificăm dacă e eroare de fonduri insuficiente
    if (err.message.toLowerCase().includes("insufficient")) {
      throw new Error("Insufficient funds! Please add funds to your wallet.");
    }
    throw err;
  }
}

/**
 * Funcție de spending generică (pentru compatibility)
 */
