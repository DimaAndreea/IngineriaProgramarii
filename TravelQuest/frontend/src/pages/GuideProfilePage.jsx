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

  // Approved (Published): hide edit & delete completely
  if (s === "APPROVED")
    return { showEditDelete: false, canEdit: false, canDelete: false };

  // Rejected: can delete, cannot edit
  if (s === "REJECTED")
    return { showEditDelete: true, canEdit: false, canDelete: true };

  // Pending: can edit & delete
  if (s === "PENDING")
    return { showEditDelete: true, canEdit: true, canDelete: true };

  return { showEditDelete: false, canEdit: false, canDelete: false };
}

function clampToFive(value) {
  if (value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.max(1, Math.min(5, n));
}

function StarRow({ value }) {
  const v = typeof value === "number" ? value : 0;

  return (
    <div
      className="gp-stars"
      aria-label={value ? `Rating ${v.toFixed(1)} out of 5` : "No rating yet"}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = v >= i;
        const half = !filled && v >= i - 0.5;
        return (
          <span
            key={i}
            className={`gp-star ${filled ? "is-filled" : half ? "is-half" : ""}`}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function initials(name) {
  const s = String(name || "").trim();
  if (!s) return "G";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "G";
}

/* ---------------- page ---------------- */

export default function GuideProfilePage() {
  const navigate = useNavigate();
  const { role, userId, username } = useAuth();

  const [itineraries, setItineraries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal edit/create (we only use it for edit here)
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  // mock rating section (no backend yet)
  const avgRatingRaw = null; // later: average from backend
  const ratingsCount = 0; // later: number of ratings from backend
  const avgRating = clampToFive(avgRatingRaw);
  const ratingPercent = avgRating == null ? 0 : (avgRating / 5) * 100;

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return itineraries;

    return itineraries.filter((it) => {
      const title = String(it.title || it.name || "").toLowerCase();
      const city = String(it.city || it.location || "").toLowerCase();
      const status = statusLabel(it.status).toLowerCase();
      return title.includes(q) || city.includes(q) || status.includes(q);
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

  return (
    <div className="gp-page">
      <div className="gp-shell">
        {/* LEFT – PROFILE */}
        <aside className="gp-profile gp-sticky">
          <section className="gp-card gp-profile-card">
            {/* (removed gp-cover) */}

            <div className="gp-profile-top gp-profile-top-noCover">
              

              <div className="gp-profile-titles">
                <h1 className="gp-title">Guide Profile</h1>
                <p className="gp-subtitle">
                  Manage your itineraries and account details
                </p>

                <div className="gp-chips">
                  <span className="gp-chip">Guide</span>
                </div>
              </div>
            </div>

            {/* rating */}
            <div className="gp-rating-card">
              <div className="gp-rating-head">
                <div>
                  <div className="gp-kicker">Average rating</div>
                  <div className="gp-rating-value">
                    {avgRating == null ? "—" : avgRating.toFixed(1)}
                    <span className="gp-rating-outof">/5</span>
                  </div>
                </div>

                <div className="gp-rating-right">
                  <StarRow value={avgRating} />
                  <div className="gp-rating-meta">
                    {ratingsCount > 0 ? `${ratingsCount} reviews` : "No ratings yet"}
                  </div>
                </div>
              </div>

              <div className="gp-rating-bar" aria-hidden="true">
                <div
                  className="gp-rating-fill"
                  style={{ width: `${ratingPercent}%` }}
                />
              </div>

           
            </div>

            {/* info rows */}
            <div className="gp-info">
              <div className="gp-info-row">
                <span className="gp-info-label">Username</span>
                <span className="gp-info-value">{username || "—"}</span>
              </div>

              <div className="gp-info-row">
                <span className="gp-info-label">Email</span>
                <span className="gp-info-value">—</span>
              </div>

              <div className="gp-info-row">
                <span className="gp-info-label">Phone</span>
                <span className="gp-info-value">—</span>
              </div>

              <div className="gp-info-row">
                <span className="gp-info-label">Role</span>
                <span className="gp-info-value">guide</span>
              </div>
            </div>

          </section>
        </aside>

        {/* RIGHT – ITINERARIES */}
        <main className="gp-main">
          <section className="gp-card gp-itins-card">
            <div className="gp-itins-header">
              <div className="gp-itins-titleblock">
                <h2 className="gp-section-title">My itineraries</h2>
                <p className="gp-subtitle">
                  {loading
                    ? "Loading..."
                    : `${filtered.length} shown • ${itineraries.length} total`}
                </p>
              </div>

              <div className="gp-itins-actions">
                <div className="gp-search">
                  <svg
                    className="gp-search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="16.65"
                      y1="16.65"
                      x2="22"
                      y2="22"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>

                  <input
                    className="gp-search-input"
                    placeholder="Search by title or status..."
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

            {err && <div className="gp-banner">{err}</div>}

            {loading ? (
              <div className="gp-loading">Loading itineraries...</div>
            ) : filtered.length === 0 ? (
              <div className="gp-empty">
                <strong>No results.</strong>
                <div>Try adjusting your search.</div>
              </div>
            ) : (
              <div className="gp-itins-grid">
                {filtered.map((it) => {
                  const perms = permissionsForStatus(it.status);
                  const title = it.title || it.name || `Itinerary #${it.id}`;
                  const city = it.city || it.location || "—";

                  return (
                    <article key={it.id} className="gp-itin-card">
                      {/* (removed gp-itin-accent bar) */}

                      <header className="gp-itin-head">
                        <div className="gp-itin-titlewrap">
                          <h3 className="gp-itin-title" title={title}>
                            {title}
                          </h3>
                        </div>

                        <span className={`gp-status-badge ${statusClass(it.status)}`}>
                          {statusLabel(it.status)}
                        </span>
                      </header>

                      <div className="gp-itin-meta">
                        <div>
                          <b>City:</b> {city}
                        </div>
                      </div>

                      <div className="gp-itin-actions">
                        <button
                          className="gp-btn gp-btn-primary"
                          onClick={() => navigate(`/itineraries/${it.id}`)}
                        >
                          View
                        </button>

                        {perms.showEditDelete && perms.canEdit && (
                          <button className="gp-btn" onClick={() => handleEditOpen(it)}>
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
        </main>

        {/* EDIT MODAL (stays on profile page) */}
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
    </div>
  );
}
