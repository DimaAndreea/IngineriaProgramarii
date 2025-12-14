import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TouristProfilePage.css";

import { useAuth } from "../context/AuthContext";
import { filterItineraries } from "../services/itineraryService";

export default function TouristProfilePage() {
  const navigate = useNavigate();
  const { userId, username, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allItineraries, setAllItineraries] = useState([]);
  const [query, setQuery] = useState("");
  const [viewAll, setViewAll] = useState(false);

  // toggle active/history
  const [tab, setTab] = useState("active"); // "active" | "history"

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        if (!userId) throw new Error("Missing user id. Please log in again.");

        // folosim doar ce există deja: filterItineraries
        const data = await filterItineraries({ participant: true }, userId);
        setAllItineraries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load your itineraries.");
        setAllItineraries([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  // "now" fixat (nu se schimbă la rerender)
  const now = useMemo(() => new Date(), []);

  const { activeList, historyList } = useMemo(() => {
    const active = [];
    const history = [];

    for (const it of allItineraries) {
      const end = it?.endDate ? new Date(it.endDate) : null;

      // dacă nu avem endDate, îl considerăm "active" doar ca să nu dispară
      if (!end) {
        active.push(it);
        continue;
      }

      if (end >= now) active.push(it);
      else history.push(it);
    }

    // sort: active by startDate asc, history by endDate desc
    active.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    history.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    return { activeList: active, historyList: history };
  }, [allItineraries, now]);

  const getFirstLocation = (it) => {
    if (Array.isArray(it?.locations) && it.locations.length > 0) return it.locations[0];
    return null;
  };

  const getCity = (it) => {
    const loc = getFirstLocation(it);
    return loc?.city || loc?.name || it?.city || "—";
  };

  const getCountry = (it) => {
    const loc = getFirstLocation(it);
    return loc?.country || it?.country || "—";
  };

  const visibleList = useMemo(() => {
    const base = tab === "active" ? activeList : historyList;

    const q = query.trim().toLowerCase();

    const filtered = q
      ? base.filter((it) => {
          const title = String(it.title || it.name || "").toLowerCase();
          const city = String(getCity(it) || "").toLowerCase();
          const country = String(getCountry(it) || "").toLowerCase();

          return title.includes(q) || city.includes(q) || country.includes(q);
        })
      : base;

    return viewAll ? filtered : filtered.slice(0, 6);
  }, [tab, activeList, historyList, query, viewAll]);

  const totalCount = tab === "active" ? activeList.length : historyList.length;

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getPill = () => {
    if (tab === "active") return { label: "Active", cls: "pill pill-active" };
    return { label: "Completed", cls: "pill pill-history" };
  };

  const openDetails = (id) => navigate(`/itineraries/${id}`);

  // left profile values (ca la ghid)
  const email = "—";
  const phone = "—";

  // dacă vrei să blochezi pagina pentru non-tourist:
  if (role && role.toLowerCase() !== "tourist") return null;

  const pill = getPill();

  return (
    <div className="tourist-profile-page">
      <div className="tourist-profile-grid">
        {/* LEFT CARD (same vibe ca Guide Profile) */}
        <aside className="tourist-left-card">
          <h1 className="tourist-profile-title">Tourist Profile</h1>
          <p className="tourist-profile-subtitle">
            See your account details and itinerary history
          </p>

          <div className="tourist-role-pill">Tourist</div>

          {/* summary card */}
          <div className="tourist-summary-box">
            <div className="tourist-summary-label">ITINERARIES</div>

            <div className="tourist-summary-main">
              <span className="tourist-summary-number">{allItineraries.length || 0}</span>
              <span className="tourist-summary-muted">total joined</span>
            </div>

            <div className="tourist-summary-row">
              <span className="tourist-summary-chip">
                Active: <strong>{activeList.length}</strong>
              </span>
              <span className="tourist-summary-chip">
                History: <strong>{historyList.length}</strong>
              </span>
            </div>

            <div className="tourist-summary-divider" />
          </div>

          {/* account details */}
          <div className="tourist-details">
            <div className="tourist-detail-row">
              <span className="tourist-detail-key">Username</span>
              <span className="tourist-detail-value">{username || "—"}</span>
            </div>

            <div className="tourist-detail-row">
              <span className="tourist-detail-key">Email</span>
              <span className="tourist-detail-value">{email}</span>
            </div>

            <div className="tourist-detail-row">
              <span className="tourist-detail-key">Phone</span>
              <span className="tourist-detail-value">{phone}</span>
            </div>

            <div className="tourist-detail-row">
              <span className="tourist-detail-key">Role</span>
              <span className="tourist-detail-value">{role || "tourist"}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT CARD */}
        <main className="tourist-right-card">
          <div className="tourist-right-top">
            <div>
              <h2 className="tourist-right-title">
                {tab === "active" ? "My active itineraries" : "My itinerary history"}
              </h2>

              <div className="tourist-right-meta">
                {loading ? "Loading..." : `${visibleList.length} shown`}
                <span className="dot">•</span>
                {totalCount} total
              </div>
            </div>

            <div className="tourist-right-actions">
              <div className="tourist-search">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, city or country..."
                />
                {query && (
                  <button
                    type="button"
                    className="tourist-search-clear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                className="tourist-viewall-btn"
                onClick={() => setViewAll((v) => !v)}
              >
                {viewAll ? "Show less" : "View all"}
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="tourist-tabs">
            <button
              type="button"
              className={`tourist-tab ${tab === "active" ? "active" : ""}`}
              onClick={() => {
                setTab("active");
                setViewAll(false);
              }}
            >
              Active
            </button>
            <button
              type="button"
              className={`tourist-tab ${tab === "history" ? "active" : ""}`}
              onClick={() => {
                setTab("history");
                setViewAll(false);
              }}
            >
              History
            </button>
          </div>

          {loading && <p className="tourist-muted">Loading...</p>}
          {error && <p className="tourist-error">{error}</p>}

          {!loading && !error && visibleList.length === 0 && (
            <div className="tourist-empty">
              {tab === "active"
                ? "You don’t have any active itineraries."
                : "You don’t have any past itineraries yet."}
            </div>
          )}

          <div className="tourist-itinerary-list">
            {visibleList.map((it) => {
              const title = it.title || it.name || "Untitled";
              const city = getCity(it);
              const country = getCountry(it);

              return (
                <div key={it.id} className="tourist-itinerary-card">
                  <div className="tourist-itinerary-card-top">
                    <div className="tourist-itinerary-title">{title}</div>
                    <span className={pill.cls}>{pill.label}</span>
                  </div>

                  <div className="tourist-itinerary-meta">
                    <div>
                      <strong>City:</strong> {city}
                      {country && country !== "—" ? `, ${country}` : ""}
                    </div>

                    <div className="tourist-itinerary-dates">
                      {formatDate(it.startDate)} → {formatDate(it.endDate)}
                    </div>
                  </div>

                  <div className="tourist-itinerary-actions">
                    <button
                      type="button"
                      className="tourist-blue-btn"
                      onClick={() => openDetails(it.id)}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
