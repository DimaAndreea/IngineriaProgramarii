const KEY = "tourist_enrollments_v1";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/**
 * Salvează un itinerariu la care turistul s-a înscris.
 * id: number/string
 */
export function addEnrollment(itineraryId) {
  const id = Number(itineraryId);
  const list = read();
  if (!list.includes(id)) {
    write([...list, id]);
  }
}

export function getEnrollments() {
  return read().map(Number);
}

export function removeEnrollment(itineraryId) {
  const id = Number(itineraryId);
  write(read().filter((x) => Number(x) !== id));
}

export function clearEnrollments() {
  localStorage.removeItem(KEY);
}
