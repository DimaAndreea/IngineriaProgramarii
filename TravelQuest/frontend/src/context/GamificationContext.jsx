// src/context/GamificationContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getGamificationSummary } from "../services/gamificationService";
import LevelUpCelebration from "../components/gamification/LevelUpCelebration";
import { onGamificationMaybeUpdated } from "../utils/gamificationEvents";
import { useAuth } from "./AuthContext";

const GamificationContext = createContext(null);

function getLevelKey(userId) {
  return `gami_last_level_${userId}`;
}
function getShownKey(userId) {
  return `gami_shown_level_${userId}`;
}

function readLastLevel(userId) {
  try {
    const n = Number(localStorage.getItem(getLevelKey(userId)));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeLastLevel(userId, level) {
  try {
    localStorage.setItem(getLevelKey(userId), String(level));
  } catch {}
}

function readShownLevel(userId) {
  try {
    const n = Number(localStorage.getItem(getShownKey(userId)));
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeShownLevel(userId, level) {
  try {
    localStorage.setItem(getShownKey(userId), String(level));
  } catch {}
}

function normalizeSummary(raw) {
  if (!raw) return null;

  // backend DTO: { level, xp, nextLevelMinXp, ... }
  const level =
    raw?.level ?? raw?.lvl ?? raw?.currentLevel ?? raw?.levelNumber ?? null;

  const xp =
    Number(raw?.xp ?? raw?.currentXp ?? raw?.points ?? raw?.currentPoints ?? 0) ||
    0;

  // ca GamificationCard-ul tău să înțeleagă:
  const xpForNextLevel =
    raw?.xpForNextLevel ??
    raw?.requiredXp ??
    raw?.xpRequired ??
    raw?.nextLevelMinXp ??
    raw?.nextLevelPoints ??
    null;

  return {
    ...raw,
    level,
    xp,
    currentXp: xp, // compat
    xpForNextLevel, // compat
  };
}

// cheie minimă ca să detectăm schimbări reale (evităm re-render inutil + “refresh flicker”)
function buildKey(norm) {
  if (!norm) return "";
  const lvl = norm?.level ?? "";
  const xp = norm?.xp ?? norm?.currentXp ?? "";
  const next = norm?.xpForNextLevel ?? norm?.nextLevelMinXp ?? "";
  // dacă vrei să fie și mai strict, poți adăuga selectedBadge?.id
  return `${lvl}|${xp}|${next}`;
}

export function GamificationProvider({ children, pollMs = 5000 }) {
  const { role, userId } = useAuth();

  // doar userii logați (tourist/guide/admin) au sens să vadă HUD/celebration
  const isLoggedInRole =
    !!role &&
    ["tourist", "guide", "admin"].includes(String(role).toLowerCase());

  const [summary, setSummary] = useState(null);

  // 🔥 “initialLoading” doar pentru prima încărcare
  const [initialLoading, setInitialLoading] = useState(true);

  // 🔥 nu mai folosim loading vizibil pentru polling; păstrăm doar un flag intern
  const [refreshing, setRefreshing] = useState(false);

  const [err, setErr] = useState("");

  // celebration
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState(null);

  const inFlightRef = useRef(false);
  const debounceRef = useRef(null);
  const lastFetchAtRef = useRef(0);

  const lastLevelRef = useRef(readLastLevel(userId));
  const shownLevelRef = useRef(readShownLevel(userId));
  // păstrăm ultima versiune “egală” ca să nu setăm state dacă nu s-a schimbat nimic
  const lastKeyRef = useRef("");

  const refresh = async ({ silent = true } = {}) => {
    if (!isLoggedInRole) return;

    // mic guard ca să nu spamăm dacă vin 20 events în 1s
    const now = Date.now();
    if (now - lastFetchAtRef.current < 250) return;

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    // ❗ NU mai setăm summary=null și NU mai setăm “loading” care produce flicker
    if (!silent) setRefreshing(true);
    if (initialLoading) setErr("");

    try {
      const raw = await getGamificationSummary();
      const norm = normalizeSummary(raw);

      // update UI doar dacă s-a schimbat ceva relevant
      const key = buildKey(norm);
      if (key !== lastKeyRef.current) {
        lastKeyRef.current = key;
        setSummary(norm);
      }

      // detect level-up (doar când crește)
      const lvl = norm?.level;
      if (lvl != null && userId) {
        const next = Number(lvl);
        const prev = Number(lastLevelRef.current);

        if (Number.isFinite(next)) {
          if (Number.isFinite(prev) && next > prev) {
            // Level-up detected! Check if we've already shown notification for this level
            const shownLevel = Number(shownLevelRef.current);
            // Only show notification if we haven't already shown it for this level
            if (next !== shownLevel) {
              setLevelUpTo(next);
              setLevelUpOpen(true);
              writeShownLevel(userId, next);
              shownLevelRef.current = next;
            }
          }
          lastLevelRef.current = next;
          writeLastLevel(userId, next);
        }
      }

      setErr("");
    } catch (e) {
      // la silent refresh, nu vrem “flash” în UI.
      // păstrăm ultimul summary afișat și doar setăm eroarea (poți chiar să o ignori complet)
      const msg = e?.message || "Failed to load gamification.";
      if (initialLoading) {
        // dacă e prima încărcare și pică, are sens să știe user-ul
        setErr(msg);
        setSummary(null);
      } else {
        // după ce avem deja date: nu stricăm UI-ul
        // opțional: log în console
        // console.warn("[gami] refresh failed:", msg);
      }
    } finally {
      lastFetchAtRef.current = Date.now();
      inFlightRef.current = false;
      if (!silent) setRefreshing(false);
      if (initialLoading) setInitialLoading(false);
    }
  };

  // Debounced refresh (folosit de events)
  // Instant refresh (fără debounce)
  const requestRefresh = () => {
    if (!isLoggedInRole) return;
    refresh({ silent: true });
  };

  // 1) polling fallback
  useEffect(() => {
    if (!isLoggedInRole) return;

    refresh({ silent: true }); // initial
    const t = window.setInterval(() => {
      // nu pollez dacă tab-ul e hidden
      if (document.visibilityState === "visible") refresh({ silent: true });
    }, pollMs);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedInRole, pollMs]);

  // 2) refresh când revine tab-ul
  useEffect(() => {
    if (!isLoggedInRole) return;

    const onVis = () => {
      if (document.visibilityState === "visible") refresh({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedInRole]);

  // 3) subscribe la events globale (axios/fetch wrappers)
  useEffect(() => {
    if (!isLoggedInRole) return;
    return onGamificationMaybeUpdated(() => requestRefresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedInRole]);

  // 4) patch global fetch: orice POST/PUT/PATCH/DELETE către backend => emite refresh
  useEffect(() => {
    if (!isLoggedInRole) return;

    const originalFetch = window.fetch;
    let installed = true;

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);

      try {
        const input = args[0];
        const init = args[1] || {};
        const method = String(init.method || "GET").toUpperCase();

        // url poate fi string sau Request
        const url = typeof input === "string" ? input : input?.url;

        // doar request-uri către backend-ul tău
        const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8088")
          .replace(/\/$/, "");
        const isBackendCall = typeof url === "string" && url.startsWith(base);

        if (
          isBackendCall &&
          ["POST", "PUT", "PATCH", "DELETE"].includes(method)
        ) {
          // doar dacă e ok
          if (res?.ok) requestRefresh();
        }
      } catch {
        // ignore
      }

      return res;
    };

    return () => {
      if (installed) window.fetch = originalFetch;
      installed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedInRole]);

  const value = useMemo(() => {
    return {
      summary,
      // păstrăm “loading” compat cu ce ai deja în UI: adevărat doar la prima încărcare
      loading: initialLoading,
      // pentru debug / indicator discret dacă vrei
      refreshing,
      error: err,
      refresh: () => refresh({ silent: false }), // manual “non-silent”
      requestRefresh, // debounced / silent      // TEST: trigger manual level up pentru vizualizare
      triggerTestLevelUp: (level) => {
        setLevelUpTo(level);
        setLevelUpOpen(true);
      },    };
  }, [summary, initialLoading, refreshing, err]);

  return (
    <GamificationContext.Provider value={value}>
      {children}

      {/* ✅ Global celebration, pe orice pagină */}
      <LevelUpCelebration
        open={levelUpOpen}
        newLevel={levelUpTo}
        onClose={() => setLevelUpOpen(false)}
        autoCloseMs={2200}
      />
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx)
    throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}
