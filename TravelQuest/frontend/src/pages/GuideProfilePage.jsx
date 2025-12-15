import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyItineraries,
  deleteItinerary,
  updateItinerary,
} from "../services/itineraryService";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import "./GuideProfilePage.css";

import { getMyProfile } from "../services/userService";
import MyBadgesSection from "../components/badges/MyBadgesSection";

/* ---------------- helpers ---------------- */

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

function statusLabel(status) {
  const s = normalizeStatus(status);
  if (s === "APPROVED") return "Published";
  if (s === "PENDING") return "Pending";
  if (s === "REJECTED") return "Rejected";
  return "Unknown";
}

function statusClass(status) {
  const s = normalizeStatus(status).toLowerCase();
  if (!s) return "status-unknown";
  return `status-${s}`;
}

function permissionsForStatus(status) {
  const s = normalizeStatus(status);

  if (s === "APPROVED")
    return { showEditDelete: false, canEdit: false, canDelete: false };

  if (s === "REJECTED")
    return { showEditDelete: true, canEdit: false, canDelete: true };

  if (s === "PENDING")
    return { showEditDelete: true, canEdit: true, canDelete: true };

  return { showEditDelete: false, canEdit: false, canDelete: false };
}

/* ---------- small icons ---------- */

function PinIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="gp-mini-icon"
    >
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="gp-mini-icon"
    >
      <path
        d="M8 3v3M16 3v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --- colored badge icon (header) --- */
function BadgeMedalIcon({ size = 44 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="gp-badge-icon"
    >
      <path d="M22 38L14 60L28 52L32 60L32 38H22Z" fill="#60A5FA" />
      <path d="M42 38L50 60L36 52L32 60L32 38H42Z" fill="#F472B6" />

      <circle
        cx="32"
        cy="28"
        r="16"
        fill="#FDE68A"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="28"
        r="12"
        fill="#FFF7ED"
        stroke="#F59E0B"
        strokeWidth="2"
      />

      <path
        d="M32 18L35 25L43 26L37 31L39 39L32 35L25 39L27 31L21 26L29 25L32 18Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- page ---------------- */

export default function GuideProfilePage() {
  const navigate = useNavigate();
  const { role, userId, username } = useAuth();

  const [itineraries, setItineraries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [profile, setProfile] = useState(null);

  // modal edit
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  // selected badge from MyBadgesSection
  const [selectedBadge, setSelectedBadge] = useState(null);

  const now = useMemo(() => new Date(), []);

  async function loadProfile() {
    try {
      const data = await getMyProfile();
      setProfile(data || null);
    } catch {
      setProfile(null);
    }
  }

  async function refreshItineraries() {
    if (!userId) return;
    const data = await getMyItineraries(userId);
    setItineraries(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        if (!userId) throw new Error("Missing user id. Please log in again.");

        const data = await getMyItineraries(userId);
        if (!alive) return;

        setItineraries(Array.isArray(data) ? data : []);

        // profile in paralel (pt badge fallback)
        loadProfile();
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load itineraries.");
        setItineraries([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    if (role === "guide") load();
    return () => {
      alive = false;
    };
  }, [userId, role]);

  const getFirstLocation = (it) => {
    if (Array.isArray(it?.locations) && it.locations.length > 0)
      return it.locations[0];
    return null;
  };

  const getCity = (it) => {
    const loc = getFirstLocation(it);
    return loc?.city || loc?.name || it?.city || it?.location || "—";
  };

  const getCountry = (it) => {
    const loc = getFirstLocation(it);
    return loc?.country || it?.country || "—";
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ✅ header stats: Active / Upcoming / Past
  // ✅ past = DOAR itinerarii trecute + Published (APPROVED)
  const headerStats = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let past = 0;

    for (const it of itineraries) {
      const start = it?.startDate ? new Date(it.startDate) : null;
      const end = it?.endDate ? new Date(it.endDate) : null;

      // ✅ past: end < now AND status APPROVED
      if (end && end < now) {
        if (normalizeStatus(it?.status) === "APPROVED") {
          past += 1;
        }
        continue;
      }

      // upcoming = start > now (și nu e past)
      if (start && start > now) {
        upcoming += 1;
        continue;
      }

      // rest = active (inclusiv dacă lipsesc datele / end null)
      active += 1;
    }

    return { active, upcoming, past };
  }, [itineraries, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return itineraries;

    return itineraries.filter((it) => {
      const title = String(it.title || it.name || "").toLowerCase();
      const city = String(getCity(it) || "").toLowerCase();
      const country = String(getCountry(it) || "").toLowerCase();
      const status = statusLabel(it.status).toLowerCase();
      return (
        title.includes(q) ||
        city.includes(q) ||
        country.includes(q) ||
        status.includes(q)
      );
    });
  }, [search, itineraries]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this itinerary?")) return;
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert(e?.message || "Delete failed.");
    }
  }

  async function handleEditOpen(it) {
    setSelected(it);
    setShowModal(true);
  }

  async function handleEditSubmit(payload) {
    const id = payload.id || payload.itineraryId;
    await updateItinerary(id, payload);
    await refreshItineraries();
    setShowModal(false);
    setSelected(null);
  }

  if (role !== "guide") return null;

  const selectedBadgeName =
    selectedBadge?.name || profile?.selectedBadge?.name || null;

  return (
    <div className="gp-page">
      {/* ================= HEADER CARD ================= */}
      <section className="gp-header-card">
        <div className="gp-header-left">
          <div className="gp-avatar">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" fill="rgba(15,23,42,.35)" />
              <path
                d="M4 20c1.6-4 5-6 8-6s6.4 2 8 6"
                fill="rgba(15,23,42,.20)"
              />
            </svg>
          </div>

          <div>
            <h1 className="gp-name">{username || "—"}</h1>
            <div className="gp-role">Guide</div>
          </div>
        </div>

        {/* ✅ Stats: Active / Upcoming / Past */}
        <div className="gp-header-center">
          <div className="gp-header-stats">
            <span>
              <b>{headerStats.active}</b> active
            </span>
            <span className="gp-dot">•</span>
            <span>
              <b>{headerStats.upcoming}</b> upcoming
            </span>
            <span className="gp-dot">•</span>
            <span>
              <b>{headerStats.past}</b> past
            </span>
          </div>
        </div>

        {/* ✅ badge: icon doar dacă există badge */}
        <div className="gp-header-right">
          {selectedBadgeName ? (
            <>
              <BadgeMedalIcon size={44} />
              <div>
                <div className="gp-badge-kicker">Visible badge</div>
                <div className="gp-badge-name">{selectedBadgeName}</div>
              </div>
            </>
          ) : (
            <div>
              <div className="gp-badge-kicker">Visible badge</div>
              <div className="gp-badge-name">None selected</div>
            </div>
          )}
        </div>
      </section>

      {/* ================= BADGES CARD ================= */}
      <section className="gp-card gp-section-card">
        <MyBadgesSection onSelectedChange={setSelectedBadge} />
      </section>

      {/* ================= ITINERARIES CARD ================= */}
      <section className="gp-card gp-section-card">
        <div className="gp-itins-head">
          <div>
            <h2 className="gp-section-title">My itineraries</h2>
            <div className="gp-section-sub">
              {loading
                ? "Loading..."
                : `${filtered.length} shown • ${itineraries.length} total`}
            </div>
          </div>

          <div className="gp-itins-actions">
            <div className="gp-search">
              <input
                className="gp-search-input"
                placeholder="Search by title, city, country or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="gp-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button className="gp-btn" onClick={() => navigate("/itineraries")}>
              View all
            </button>
          </div>
        </div>

        {err && <div className="gp-empty">{err}</div>}

        {loading ? (
          <div className="gp-loading">Loading itineraries...</div>
        ) : filtered.length === 0 ? (
          <div className="gp-empty">
            <strong>No results.</strong>
            <div>Try adjusting your search.</div>
          </div>
        ) : (
          <div className="gp-itins-list">
            {filtered.map((it) => {
              const perms = permissionsForStatus(it.status);
              const title = it.title || it.name || `Itinerary #${it.id}`;

              const city = getCity(it);
              const country = getCountry(it);
              const location =
                country && country !== "—" ? `${city}, ${country}` : city;

              return (
                <article key={it.id} className="gp-itin-row">
                  <div className="gp-itin-left">
                    <div className="gp-itin-row-top">
                      <div className="gp-itin-title-wrap">
                        <h3 className="gp-itin-title" title={title}>
                          {title}
                        </h3>

                        <span
                          className={`gp-status-badge ${statusClass(it.status)}`}
                        >
                          {statusLabel(it.status)}
                        </span>
                      </div>
                    </div>

                    <div className="gp-itin-meta">
                      <div className="gp-meta-line">
                        <PinIcon />
                        <span>
                          <b>Location:</b> {location}
                        </span>
                      </div>

                      <div className="gp-meta-line">
                        <CalendarIcon />
                        <span>
                          {formatDate(it.startDate)} → {formatDate(it.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="gp-itin-actions-right">
                    <button
                      className="gp-btn gp-btn-primary"
                      onClick={() => navigate(`/itineraries/${it.id}`)}
                    >
                      View
                    </button>

                    {perms.showEditDelete && perms.canEdit && (
                      <button
                        className="gp-btn"
                        onClick={() => handleEditOpen(it)}
                      >
                        Edit
                      </button>
                    )}

                    {perms.showEditDelete && perms.canDelete && (
                      <button
                        className="gp-btn gp-btn-danger"
                        onClick={() => handleDelete(it.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ItineraryForm
        visible={showModal}
        initialValues={selected}
        onSubmit={handleEditSubmit}
        onClose={() => {
          setShowModal(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
