// src/utils/gamificationEvents.js
const EVENT_NAME = "gamification:maybeRefresh";

/**
 * Emite un semnal global că “s-ar putea să se fi schimbat XP/level”.
 * Provider-ul decide dacă face refresh (debounced).
 */
export function notifyGamificationMaybeUpdated() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Subscribe helper */
export function onGamificationMaybeUpdated(handler) {
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
