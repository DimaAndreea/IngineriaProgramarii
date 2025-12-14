const KEY = "travelquest_enrollments_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Structură:
 * {
 *   "<userId>": {
 *      "<itineraryId>": true
 *   }
 * }
 */
function readAll() {
  const raw = localStorage.getItem(KEY);
  const data = safeParse(raw);
  return data && typeof data === "object" ? data : {};
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function isJoined(userId, itineraryId) {
  if (!userId || !itineraryId) return false;
  const all = readAll();
  return !!all[String(userId)]?.[String(itineraryId)];
}

export function markJoined(userId, itineraryId) {
  if (!userId || !itineraryId) return;
  const all = readAll();
  const uid = String(userId);
  const iid = String(itineraryId);

  if (!all[uid]) all[uid] = {};
  all[uid][iid] = true;

  writeAll(all);
}

export function unmarkJoined(userId, itineraryId) {
  if (!userId || !itineraryId) return;
  const all = readAll();
  const uid = String(userId);
  const iid = String(itineraryId);

  if (all[uid]) {
    delete all[uid][iid];
    writeAll(all);
  }
}
