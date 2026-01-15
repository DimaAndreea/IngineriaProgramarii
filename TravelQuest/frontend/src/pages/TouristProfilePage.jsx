import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./TouristProfilePage.css";

import { useAuth } from "../context/AuthContext";
import { filterItineraries } from "../services/itineraryService";
import MyBadgesSection from "../components/badges/MyBadgesSection";
import { getMyProfile } from "../services/userService";

import GamificationCard from "../components/gamification/GamificationCard";
import { getGamificationSummary } from "../services/gamificationService";

/* ---------------- helpers ---------------- */

const ENROLLMENTS_KEY = "tourist_enrollments_v1";
function readEnrollments() {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]").map(Number);
  } catch {
    return [];
  }
}

const parseDate = (value, { endOfDay = false } = {}) => {
  if (!value) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));

  if (isDateOnly) {
    const [y, m, d] = String(value).split("-").map(Number);
    return endOfDay
      ? new Date(y, m - 1, d, 23, 59, 59, 999)
      : new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  return new Date(value);
};

/** returnează true dacă turistul e înscris în itinerariu (după datele venite din backend) */
function isTouristInItinerary(it, touristId) {
  if (!touristId) return false;

  const participants =
    it?.participants || it?.enrolledTourists || it?.tourists || it?.joinedUsers || [];

  if (Array.isArray(participants)) {
    return participants.some((p) => {
      const t = p?.tourist || p?.user || p;
      const pid = t?.id ?? p?.id;
      return Number(pid) === Number(touristId);
    });
  }

  const participantIds =
    it?.participantIds || it?.touristIds || it?.participantsIds;
  if (Array.isArray(participantIds)) {
    return participantIds.map(Number).includes(Number(touristId));
  }

  return false;
}

/* avatar anonim */
function AvatarIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
      <circle cx="32" cy="26" r="10" fill="#9CA3AF" />
      <path d="M16 52c2-8 28-8 32 0" fill="#9CA3AF" />
    </svg>
  );
}

/* badge icon */
function PrettyBadgeIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="badge-icon">
      <defs>
        <linearGradient id="gold" x1="14" y1="12" x2="52" y2="52">
          <stop stopColor="#FDE68A" />
          <stop offset="0.55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ribbonL" x1="8" y1="36" x2="30" y2="60">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="ribbonR" x1="34" y1="36" x2="56" y2="60">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      <path d="M18 38 12 60 24 54 30 60 30 40" fill="url(#ribbonL)" opacity="0.95" filter="url(#soft)" />
      <path d="M46 38 52 60 40 54 34 60 34 40" fill="url(#ribbonR)" opacity="0.95" filter="url(#soft)" />

      <circle cx="32" cy="28" r="16.5" fill="url(#gold)" filter="url(#soft)" />
      <circle cx="32" cy="28" r="16.5" stroke="rgba(17,24,39,0.18)" />

      <path
        d="M32 18.5 35.1 25.3 42.5 26.2 37 31 38.6 38.3 32 34.6 25.4 38.3 27 31 21.5 26.2 28.9 25.3 32 18.5Z"
        fill="rgba(255,255,255,0.9)"
        stroke="rgba(17,24,39,0.10)"
      />
    </svg>
  );
}

/* icons itineraries */
function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="tp-mini-icon">
      <path
        d="M12 22s7-4.2 7-11a7 7 0 1 0-14 0c0 6.8 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CalendarIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="tp-mini-icon">
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TouristProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { userId, username, role } = useAuth();

  // Gamification state (NO MOCK)
  const [gami, setGami] = useState(null);
  const [gamiLoading, setGamiLoading] = useState(false);
  const [gamiErr, setGamiErr] = useState("");

  // Level up UI states
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [levelUpGlow, setLevelUpGlow] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState(null);
  const prevLevelRef = React.useRef(null);

  // /tourists/:id => public mode
  const publicTouristId = params?.id ? Number(params.id) : null;

  // owner mode: /profile/tourist (protected) + role tourist
  const isOwnerMode = !publicTouristId && role?.toLowerCase() === "tourist";
  const isPublicMode = !!publicTouristId;

  // state primit din Link (poate să lipsească)
  const touristFromState = location?.state?.tourist || null;

  // pe cine afișăm
  const targetTouristId = isOwnerMode
    ? Number(userId)
    : Number(publicTouristId || touristFromState?.id || 0) || null;

  const displayName =
    (isOwnerMode ? username : touristFromState?.username) ||
    touristFromState?.name ||
    touristFromState?.email ||
    (isPublicMode ? `Tourist #${publicTouristId}` : "Tourist");

  const displayLevel = touristFromState?.level ?? null;

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [profile, setProfile] = useState(null);

  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      // reset gamification state on route changes
      if (isOwnerMode) {
        setGamiErr("");
      } else {
        setGami(null);
        setGamiErr("");
        setGamiLoading(false);
      }

      try {
        // 1) Itinerarii
        if (!targetTouristId) throw new Error("Missing tourist id.");

        const itData = await filterItineraries({ participant: true }, targetTouristId);
        if (!alive) return;

        const list = Array.isArray(itData) ? itData : [];

        // 2) Filtrare sigură
        let filtered = list.filter((it) => isTouristInItinerary(it, targetTouristId));

        // 3) Fallback localStorage (owner only)
        if (isOwnerMode) {
          const enrollments = readEnrollments();
          filtered = list.filter((it) => {
            const inParticipants = isTouristInItinerary(it, targetTouristId);
            const inLocal = enrollments.includes(Number(it?.id));
            return inParticipants || inLocal;
          });
        }

        setItineraries(filtered);

        // 4) Profil (owner only)
        if (isOwnerMode) {
          const prof = await getMyProfile().catch(() => null);
          if (!alive) return;
          setProfile(prof || null);
        } else {
          setProfile(null);
        }

        // 5) Gamification (owner only) — ONLY BACKEND
        if (isOwnerMode) {
          setGamiLoading(true);
          setGamiErr("");
          try {
            const gs = await getGamificationSummary();
            if (!alive) return;
            setGami(gs || null);
          } catch (e2) {
            if (!alive) return;
            setGami(null);
            setGamiErr(e2?.message || "Failed to load gamification.");
          } finally {
            if (alive) setGamiLoading(false);
          }
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load profile.");
        setItineraries([]);
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [isOwnerMode, targetTouristId]);

  // Detect level-up (for animation)
  useEffect(() => {
    if (!isOwnerMode) return;

    const lvl =
      gami?.level ??
      gami?.lvl ??
      gami?.currentLevel ??
      gami?.levelNumber ??
      null;

    if (lvl == null) return;

    const next = Number(lvl);

    // init
    if (prevLevelRef.current == null) {
      prevLevelRef.current = next;
      return;
    }

    const prev = Number(prevLevelRef.current);

    // level up only when it increases
    if (Number.isFinite(prev) && Number.isFinite(next) && next > prev) {
      setLevelUpTo(next);
      setLevelUpOpen(true);
      setLevelUpGlow(true);

      window.setTimeout(() => setLevelUpOpen(false), 2400);
      window.setTimeout(() => setLevelUpGlow(false), 1800);
    }

    prevLevelRef.current = next;
  }, [gami, isOwnerMode]);

  // contact doar pentru owner (private)
  const email = isOwnerMode ? profile?.email || "—" : "—";
  const phone = isOwnerMode ? profile?.phone || profile?.phoneNumber || "—" : "—";

  // status (Active / Upcoming / Completed)
  const withStatus = useMemo(() => {
    const nowTs = Date.now();

    return (itineraries || []).map((it) => {
      const start = parseDate(it?.startDate);
      const end = parseDate(it?.endDate, { endOfDay: true });

      let status = "Active";
      if (start && start.getTime() > nowTs) status = "Upcoming";
      else if (end && end.getTime() < nowTs) status = "Completed";

      return { ...it, __status: status };
    });
  }, [itineraries]);

  const counts = useMemo(() => {
    const active = withStatus.filter((x) => x.__status === "Active").length;
    const upcoming = withStatus.filter((x) => x.__status === "Upcoming").length;
    const past = withStatus.filter((x) => x.__status === "Completed").length;
    return { active, upcoming, past, total: withStatus.length };
  }, [withStatus]);

  const getFirstLocation = (it) =>
    Array.isArray(it?.locations) && it.locations.length > 0 ? it.locations[0] : null;

  const getCity = (it) => {
    const loc = getFirstLocation(it);
    return loc?.city || loc?.name || it?.city || "";
  };

  const getCountry = (it) => {
    const loc = getFirstLocation(it);
    return loc?.country || it?.country || "";
  };

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return withStatus;

    return withStatus.filter((it) => {
      const title = String(it.title || it.name || "").toLowerCase();
      const city = String(getCity(it) || "").toLowerCase();
      const country = String(getCountry(it) || "").toLowerCase();
      return title.includes(q) || city.includes(q) || country.includes(q);
    });
  }, [withStatus, query]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const selectedBadgeName =
    selectedBadge?.name ||
    (isOwnerMode ? profile?.selectedBadge?.name : null) ||
    touristFromState?.visibleBadgeName ||
    null;

  const showBadgesSection = isOwnerMode;

  return (
    <div className="tourist-profile-page">
      {/* Level-up popup + confetti */}
      {levelUpOpen && (
        <div className="tp-levelup-overlay" onClick={() => setLevelUpOpen(false)}>
          <div className="tp-levelup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tp-levelup-title">
              Congratulations! You've leveled up to <b>{levelUpTo}</b>!
            </div>
            <div className="tp-levelup-sub">Keep going 🚀</div>

            <div className="tp-confetti">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="tp-confetti-piece" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div className="tourist-header-card">
        {/* ROW 1 */}
        <div className="tourist-header-main">
          <div className="tourist-header-left">
            <div className={`tp-avatar ${levelUpGlow ? "tp-avatar-glow" : ""}`}>
              <AvatarIcon />
            </div>

            <div>
              <h1 className="tourist-name">{displayName}</h1>
              <span className="tourist-role">Tourist</span>

              {isPublicMode && displayLevel != null && (
                <div className="tp-contact" style={{ marginTop: 6 }}>
                  <div className="tp-contact-item">
                    <span className="tp-contact-label">Level</span>
                    <span className="tp-contact-value">{displayLevel}</span>
                  </div>
                </div>
              )}

              {isOwnerMode && (
                <div className="tp-contact">
                  <div className="tp-contact-item">
                    <span className="tp-contact-label">Email</span>
                    <span className="tp-contact-value">{email}</span>
                  </div>
                  <span className="tp-contact-dot">•</span>
                  <div className="tp-contact-item">
                    <span className="tp-contact-label">Phone</span>
                    <span className="tp-contact-value">{phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tourist-header-right">
            {selectedBadgeName ? <PrettyBadgeIcon /> : null}
            <div>
              <div className="badge-kicker">Visible badge</div>
              <div className="badge-name">{selectedBadgeName || "None selected"}</div>
            </div>
          </div>
        </div>

        {/* ROW 2: gamification full width (owner only) */}
        {isOwnerMode && (
          <div className="tourist-header-gamification">
            <GamificationCard
              summary={gami}
              loading={gamiLoading}
              error={gamiErr}
              isMock={false}
            />
          </div>
        )}
      </div>

      {/* BADGES (owner only) */}
      {showBadgesSection && (
        <div className="tourist-card">
          <MyBadgesSection onSelectedChange={setSelectedBadge} />
        </div>
      )}

      {/* ITINERARIES CARD */}
      <div className="tourist-card">
        <div className="itins-head">
          <div>
            <h2 className="itins-title">My itineraries</h2>

            <div className="itins-sub">
              <b>{counts.active}</b> active <span className="dot">•</span>{" "}
              <b>{counts.upcoming}</b> upcoming <span className="dot">•</span>{" "}
              <b>{counts.past}</b> past <span className="dot">•</span>{" "}
              <b>{counts.total}</b> total
            </div>
          </div>

          {(isOwnerMode || withStatus.length > 0) && (
            <div className="itins-search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, city or country..."
              />
              {query && (
                <button
                  type="button"
                  className="itins-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {err && <div className="tourist-banner">{err}</div>}

        {loading ? (
          <p className="tourist-muted">Loading…</p>
        ) : filteredList.length === 0 ? (
          <p className="tourist-empty">No itineraries to show.</p>
        ) : (
          <div className="itinerary-list">
            {filteredList.map((it) => {
              const title = it.title || it.name || `Itinerary #${it.id}`;
              const city = getCity(it);
              const country = getCountry(it);
              const locText = country ? `${city}, ${country}` : city || "—";

              const pillClass =
                it.__status === "Active"
                  ? "pill-active"
                  : it.__status === "Upcoming"
                  ? "pill-upcoming"
                  : "pill-history";

              return (
                <article key={it.id} className="itinerary-row">
                  <div className="itinerary-left">
                    <div className="itinerary-row-top">
                      <div className="itinerary-title-wrap">
                        <h3 className="itinerary-title" title={title}>
                          {title}
                        </h3>

                        <span className={`pill ${pillClass}`}>{it.__status}</span>
                      </div>
                    </div>

                    <div className="itinerary-meta">
                      <div className="tp-meta-line">
                        <PinIcon />
                        <span>
                          <b>Location:</b> {locText}
                        </span>
                      </div>

                      <div className="tp-meta-line">
                        <CalendarIcon />
                        <span>
                          {formatDate(it.startDate)} → {formatDate(it.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="itinerary-actions-right">
                    <button
                      className="tourist-blue-btn"
                      onClick={() => navigate(`/itineraries/${it.id}`)}
                    >
                      View
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
