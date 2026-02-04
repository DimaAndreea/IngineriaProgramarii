import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./TouristProfilePage.css";

import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { filterItineraries } from "../services/itineraryService";
import MyBadgesSection from "../components/badges/MyBadgesSection";
import { getMyProfile, getTouristProfile } from "../services/userService";
import { getGamificationSummaryByUserId } from "../services/gamificationService";

import { addFunds, getWalletBalance } from "../services/walletService";

import GamificationCard from "../components/gamification/GamificationCard";
import Loader from "../components/common/Loader";

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

function isTouristInItinerary(it, touristId) {
  if (!touristId) return false;

  const participants =
    it?.participants ||
    it?.enrolledTourists ||
    it?.tourists ||
    it?.joinedUsers ||
    [];

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

function ArrowIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="tp-mini-icon">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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
  const { summary: gami, loading: gamiLoading, err: gamiErr } = useGamification();

  // /tourists/:id => public mode
  const publicTouristId = params?.id ? Number(params.id) : null;

  // owner mode: /profile/tourist (protected) + role tourist
  const isOwnerMode = !publicTouristId && role?.toLowerCase() === "tourist";
  const isPublicMode = !!publicTouristId;

  const touristFromState = location?.state?.tourist || null;

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

  // Wallet (owner only)
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletErr, setWalletErr] = useState("");

  const [publicGami, setPublicGami] = useState(null);
  const [publicGamiLoading, setPublicGamiLoading] = useState(false);
  const [publicGamiErr, setPublicGamiErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        if (!targetTouristId) throw new Error("Missing tourist id.");

        const itData = await filterItineraries({ participant: true }, targetTouristId);
        if (!alive) return;

        const list = Array.isArray(itData) ? itData : [];

        let filtered = list.filter((it) => isTouristInItinerary(it, targetTouristId));

        if (isOwnerMode) {
          const enrollments = readEnrollments();
          filtered = list.filter((it) => {
            const inParticipants = isTouristInItinerary(it, targetTouristId);
            const inLocal = enrollments.includes(Number(it?.id));
            return inParticipants || inLocal;
          });
        }

        setItineraries(filtered);

        if (isOwnerMode) {
          const prof = await getMyProfile().catch(() => null);
          if (!alive) return;
          setProfile(prof || null);

          // load wallet balance
          const bal = await getWalletBalance();
          if (!alive) return;
          setWalletBalance(bal);
        } else if (isPublicMode) {
          const prof = await getTouristProfile(publicTouristId).catch(() => null);
          if (!alive) return;
          setProfile(prof || null);
        } else {
          setProfile(null);
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
  }, [isOwnerMode, targetTouristId, userId, username]);

  // refresh wallet when auth changes
  useEffect(() => {
    if (!isOwnerMode) return;
    let alive = true;
    
    async function refreshBalance() {
      try {
        const bal = await getWalletBalance();
        if (alive) setWalletBalance(bal);
      } catch (e) {
        if (alive) setWalletErr(e?.message || "Failed to load wallet balance");
      }
    }
    
    refreshBalance();
    return () => { alive = false; };
  }, [isOwnerMode, userId, username]);

  useEffect(() => {
    if (!isPublicMode) return;

    let alive = true;

    async function loadPublicGami() {
      try {
        setPublicGamiLoading(true);
        setPublicGamiErr("");
        const data = await getGamificationSummaryByUserId(publicTouristId);
        if (!alive) return;
        setPublicGami(data || null);
      } catch (e) {
        if (!alive) return;
        setPublicGamiErr(e?.message || "Failed to load gamification");
        setPublicGami(null);
      } finally {
        if (!alive) return;
        setPublicGamiLoading(false);
      }
    }

    loadPublicGami();
    return () => {
      alive = false;
    };
  }, [isPublicMode, publicTouristId]);

  async function handleAddFunds() {
    setWalletErr("");
    try {
      const newBal = await addFunds({ userId, username }, walletAmount);
      setWalletBalance(newBal);
      setWalletAmount("");
      setWalletOpen(false);
    } catch (e) {
      setWalletErr(e?.message || "Failed to add funds");
    }
  }

  const email = (isOwnerMode ? profile?.email : (profile?.email || touristFromState?.email)) || "—";
  const phone =
    (isOwnerMode
      ? profile?.phone || profile?.phoneNumber
      : (profile?.phoneNumber || profile?.phone || touristFromState?.phone || touristFromState?.phoneNumber)) || "—";

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

  // ✅ adaptare DTO nou -> ce vrea GamificationCard-ul tău
  const gamiForCard = useMemo(() => {
    const data = isOwnerMode ? gami : publicGami;
    if (!data) return null;
    return {
      ...data,
      currentXp: data?.currentXp ?? data?.xp ?? 0,
      xpForNextLevel: data?.xpForNextLevel ?? data?.nextLevelMinXp ?? null,
    };
  }, [gami, publicGami, isOwnerMode]);

  const gamiLoading_ = isOwnerMode ? gamiLoading : publicGamiLoading;
  const gamiErr_ = isOwnerMode ? gamiErr : publicGamiErr;

  return (
    <div className="tourist-profile-page">
      {/* PROFILE HEADER */}
      <div className="tourist-header-card">
        <div className="tourist-header-main">
          <div className="tourist-header-left">
            <div className="tp-avatar">
              <AvatarIcon />
            </div>

            <div>
              <h1 className="tourist-name">{displayName}</h1>
              <span className="tourist-role">Tourist</span>

              <div className="tp-contact">
                <div className="tp-contact-item">
                  <img src="/mail.png" alt="Email" className="tp-contact-icon" />
                  <span className="tp-contact-value">{email}</span>
                </div>
                <span className="tp-contact-dot">•</span>
                <div className="tp-contact-item">
                  <img src="/phone.png" alt="Phone" className="tp-contact-icon" />
                  <span className="tp-contact-value">{phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tourist-header-right">
            {selectedBadgeName && loading ? (
              <Loader label="Se încarcă badge-ul..." size={56} />
            ) : selectedBadgeName ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingRight: 32 }}>
                {(() => {
                  let badgeId = null;
                  if (isOwnerMode && selectedBadge) badgeId = selectedBadge.id;
                  else if (!isOwnerMode && Array.isArray(profile?.badges)) {
                    // Pentru public: caută badge-ul selectat direct din badges
                    const selected = profile.badges.find(b => b.selected);
                    if (selected) badgeId = selected.id;
                  } else if (!isOwnerMode && profile?.selectedBadge?.id) {
                    badgeId = profile.selectedBadge.id;
                  }
                  // Try to find the badge object for visitors for correct PNG mapping
                  let badgeObj = null;
                  if (!isOwnerMode && profile?.badges && badgeId) {
                    badgeObj = profile.badges.find(b => b.id === badgeId);
                  }
                  const pngId = badgeObj ? badgeObj.id : badgeId;
                  if (pngId) {
                    return (
                      <img
                        src={`/${((pngId - 1) % 4) + 1}.png`}
                        alt="badge icon"
                        className="badge-icon-img"
                        style={{ width: 80, height: 80 }}
                      />
                    );
                  } else {
                    // DEBUG vizual pentru public: vezi ce primești
                    return (
                      <div style={{textAlign:'center'}}>
                        <PrettyBadgeIcon size={80} />
                        <div style={{color:'#e11d48',fontSize:13,marginTop:8}}>
                          <b>Badge public lipsă PNG</b><br/>
                          selectedBadge: {typeof profile?.selectedBadge !== 'undefined' ? JSON.stringify(profile.selectedBadge) : 'undefined'}<br/>
                          badges: {Array.isArray(profile?.badges) ? profile.badges.length : 'none'}<br/>
                          <details style={{marginTop:4}}>
                            <summary style={{cursor:'pointer'}}>Vezi badges JSON</summary>
                            <pre style={{fontSize:11,maxWidth:320,overflowX:'auto',background:'#fff',color:'#222',padding:6,borderRadius:4}}>{JSON.stringify(profile?.badges,null,2)}</pre>
                          </details>
                        </div>
                      </div>
                    );
                  }
                })()}
                <div className="badge-name" style={{ marginTop: 10 }}>{selectedBadgeName}</div>
              </div>
            ) : (
              <div>
                <div className="badge-name">None selected</div>
              </div>
            )}
          </div>
        </div>

        {/* Gamification */}
        <div className="tourist-header-gamification">
          <GamificationCard
            summary={gamiForCard}
            loading={gamiLoading_}
            error={gamiErr_}
            showLabel={isOwnerMode}
            isMock={false}
          />
        </div>
      </div>

      {/* WALLET & BADGES (2 COLUMNS) */}
      {isOwnerMode && (
        <div className="tourist-wallet-badges-grid">
          {/* WALLET (LEFT) */}
          <div className="tourist-card wallet-card">
            <div className="wallet-header">
              <h2 className="itins-title">My Wallet</h2>
              <img src="/wallet.png" alt="Wallet" className="wallet-icon" />
            </div>

            <div className="wallet-balance-section">
              <div className="badge-kicker">Current Balance</div>
              <div className="wallet-amount">
                {Number(walletBalance || 0).toFixed(2)} RON
              </div>
            </div>

            <button
              className="wallet-add-btn"
              onClick={() => {
                setWalletErr("");
                setWalletAmount("");
                setWalletOpen(true);
              }}
            >
              + Add funds
            </button>
          </div>

          {/* BADGES (RIGHT) */}
          {showBadgesSection && (
            <div className="tourist-card">
              <MyBadgesSection onSelectedChange={setSelectedBadge} />
            </div>
          )}
        </div>
      )}

      {/* ADD FUNDS MODAL */}
      {walletOpen && (
        <div className="add-funds-overlay" onClick={() => setWalletOpen(false)}>
          <div className="add-funds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-funds-header">
              <h2>Add Funds to Wallet</h2>
              <button
                className="add-funds-close"
                onClick={() => setWalletOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="add-funds-body">
              <label>Amount (RON):</label>
              <input
                type="number"
                min="1"
                max="999999"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
                className="add-funds-input"
              />
            </div>

            {walletErr && <div className="tourist-banner">{walletErr}</div>}

            <div className="add-funds-footer">
              <button
                className="add-funds-btn cancel"
                onClick={() => {
                  setWalletOpen(false);
                  setWalletAmount("");
                  setWalletErr("");
                }}
              >
                Cancel
              </button>
              <button
                className="add-funds-btn primary"
                onClick={handleAddFunds}
              >
                Add Funds
              </button>
            </div>
          </div>
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
          <Loader label="Loading itineraries..." />
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
                  <div className="itinerary-image">
                    <img 
                      src={
                        it.imageBase64
                          ? it.imageBase64.startsWith("data:") 
                            ? it.imageBase64 
                            : `data:image/jpeg;base64,${it.imageBase64}`
                          : "/placeholder-itinerary.jpg"
                      }
                      alt={title} 
                    />
                  </div>

                  <div className="itinerary-content">
                    <div className="itinerary-top">
                      <h3 className="itinerary-title" title={title}>
                        {title}
                      </h3>
                    </div>

                    <div className="itinerary-middle">
                      <div className="tp-meta-line">
                        <PinIcon />
                        <span>{locText}</span>
                      </div>
                    </div>

                    <div className="itinerary-bottom-row">
                      <div className="tp-meta-line">
                        <CalendarIcon />
                        <span>
                          {formatDate(it.startDate)} <ArrowIcon size={14} /> {formatDate(it.endDate)}
                        </span>
                      </div>
                      
                      <button
                        className="tourist-blue-btn"
                        onClick={() => navigate(`/itineraries/${it.id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                  
                  <span className={`pill ${pillClass}`}>{it.__status}</span>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}