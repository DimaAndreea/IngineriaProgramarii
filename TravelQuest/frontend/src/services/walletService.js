const KEY = "tq_wallet_v1";

function safeParse(v, fallback) {
  try { return JSON.parse(v); } catch { return fallback; }
}

function readAll() {
  return safeParse(localStorage.getItem(KEY) || "{}", {});
}

function writeAll(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

// userKey: folosește userId dacă ai, altfel username
function getUserKey({ userId, username }) {
  return String(userId || username || "guest");
}

export function getWalletBalance(auth) {
  const all = readAll();
  const k = getUserKey(auth);
  return Number(all[k]?.balance || 0);
}

export function addFunds(auth, amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid amount");

  const all = readAll();
  const k = getUserKey(auth);
  const current = Number(all[k]?.balance || 0);

  all[k] = { balance: +(current + value).toFixed(2), updatedAt: Date.now() };
  writeAll(all);
  return all[k].balance;
}

export function canAfford(auth, cost) {
  return getWalletBalance(auth) >= Number(cost || 0);
}

export function spend(auth, cost) {
  const c = Number(cost || 0);
  if (!Number.isFinite(c) || c < 0) throw new Error("Invalid cost");

  const all = readAll();
  const k = getUserKey(auth);
  const current = Number(all[k]?.balance || 0);

  if (current < c) throw new Error("Insufficient funds");

  all[k] = { balance: +(current - c).toFixed(2), updatedAt: Date.now() };
  writeAll(all);
  return all[k].balance;
}