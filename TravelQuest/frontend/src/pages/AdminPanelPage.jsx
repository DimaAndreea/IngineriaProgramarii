import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPendingItineraries,
  approveItinerary,
  rejectItinerary,
} from "../services/itineraryService";
import Loader from "../components/common/Loader";
import "./AdminPanelPage.css";

export default function AdminPanelPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const totalPending = pending.length;
    const uniqueGuides = new Set(
      pending.map((it) => it.creator?.username).filter(Boolean)
    ).size;
    const totalValue = pending.reduce(
      (sum, it) => sum + (Number(it.price) || 0),
      0
    );
    return { totalPending, uniqueGuides, totalValue };
  }, [pending]);

  const categoryStats = useMemo(() => {
    // Define all possible categories
    const allCategories = ["CULTURAL", "ADVENTURE", "CITY_BREAK", "ENTERTAINMENT", "EXOTIC"];
    
    // Initialize map with all categories set to 0
    const map = new Map();
    allCategories.forEach((cat) => {
      map.set(cat, { category: cat, count: 0, totalValue: 0 });
    });
    
    // Update counts for categories that have pending itineraries
    pending.forEach((it) => {
      const key = (it.category || "Other").toString();
      if (!map.has(key)) {
        map.set(key, { category: key, count: 0, totalValue: 0 });
      }
      const current = map.get(key);
      current.count += 1;
      current.totalValue += Number(it.price) || 0;
    });
    
    const list = Array.from(map.values()).sort((a, b) => b.count - a.count);
    const maxCount = Math.max(1, ...list.map((item) => item.count));
    return { list, maxCount };
  }, [pending]);

  const additionalStats = useMemo(() => {
    if (pending.length === 0) return null;

    const guideMap = new Map();
    pending.forEach((it) => {
      const guideName = it.creator?.username || "Unknown";
      const guideId = it.creator?.id;
      if (!guideMap.has(guideName)) {
        guideMap.set(guideName, { count: 0, guideId });
      }
      const current = guideMap.get(guideName);
      current.count += 1;
    });

    const topGuideEntry = Array.from(guideMap.entries()).sort((a, b) => b[1].count - a[1].count)[0];
    const averagePrice = pending.reduce((sum, it) => sum + (Number(it.price) || 0), 0) / pending.length;

    return {
      topGuideName: topGuideEntry ? topGuideEntry[0] : "—",
      topGuideCount: topGuideEntry ? topGuideEntry[1].count : 0,
      topGuideId: topGuideEntry ? topGuideEntry[1].guideId : null,
      averagePrice,
    };
  }, [pending]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatCategory = (category) =>
    (category || "Category")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const getStatusClass = (status) =>
    `admin-status admin-status-${(status || "pending").toString().toLowerCase()}`;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getPendingItineraries();
      setPending(data);
    } catch (err) {
      alert("Failed to load pending itineraries.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    await approveItinerary(id);
    setPending((prev) => prev.filter((it) => it.id !== id));
  }

  async function handleReject(id) {
    await rejectItinerary(id);
    setPending((prev) => prev.filter((it) => it.id !== id));
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader label="Loading pending itineraries..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-layout">
        <div className="admin-left">
          {pending.length > 0 ? (
            <div className="admin-chart">
              <div className="admin-chart-header">
                <div>
                  <p className="admin-chart-kicker">Insights</p>
                  <h2 className="admin-chart-title">Pending by Category</h2>
                </div>
              </div>
              <hr className="admin-chart-divider" />
              <div className="admin-chart-body">
                {categoryStats.list.map((item) => (
                  <div key={item.category} className="admin-chart-row">
                    <div className="admin-chart-labels">
                      <span className="admin-chart-category">{formatCategory(item.category).toUpperCase()}</span>
                      <span className="admin-chart-value">{item.count}</span>
                    </div>
                    <div className="admin-chart-bar">
                      <span
                        className="admin-chart-bar-fill"
                        style={{ width: `${(item.count / categoryStats.maxCount) * 100}%` }}
                      />
                    </div>
                    <p className="admin-chart-meta">
                      Total value: {formatPrice(item.totalValue)}
                    </p>
                  </div>
                ))}

                {additionalStats && (
                  <div className="admin-insights-extra">
                    <div className="admin-insight-item">
                      <p className="admin-insight-label">Top Guide</p>
                      <p className="admin-insight-value">
                        {additionalStats.topGuideId ? (
                          <Link 
                            to={`/guides/${additionalStats.topGuideId}`}
                            className="admin-guide-link"
                          >
                            {additionalStats.topGuideName}
                          </Link>
                        ) : (
                          additionalStats.topGuideName
                        )}
                        {additionalStats.topGuideCount > 0 && (
                          <span className="admin-guide-count">
                            <span className="admin-guide-star">★</span>
                            {additionalStats.topGuideCount}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="admin-insight-item">
                      <p className="admin-insight-label">Average Price</p>
                      <p className="admin-insight-value">{formatPrice(additionalStats.averagePrice)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-empty admin-empty-insights">
              <p className="empty-msg">No insights yet.</p>
            </div>
          )}
        </div>

        <div className="admin-right">
          <div className="admin-hero">
            <div>
              <p className="admin-kicker">Admin Dashboard</p>
              <h1 className="admin-title">Pending Itineraries</h1>
              <p className="admin-subtitle">
                Review and manage itineraries submitted by guides.
              </p>
            </div>
            <div className="admin-hero-glow" aria-hidden="true" />
          </div>

          <div className="admin-stats">
            <div className="admin-stat-item">
              <p className="admin-stat-label">Pending</p>
              <p className="admin-stat-value">{stats.totalPending}</p>
            </div>
            <div className="admin-stat-divider" />
            <div className="admin-stat-item">
              <p className="admin-stat-label">Guides</p>
              <p className="admin-stat-value">{stats.uniqueGuides}</p>
            </div>
            <div className="admin-stat-divider" />
            <div className="admin-stat-item">
              <p className="admin-stat-label">Total Value</p>
              <p className="admin-stat-value">{formatPrice(stats.totalValue)}</p>
            </div>
          </div>

          {pending.length === 0 ? (
            <div className="admin-empty">
              <p className="empty-msg">No itineraries pending approval.</p>
            </div>
          ) : (
            <div className="admin-grid">
              {pending.map((it) => (
                <div key={it.id} className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <p className="admin-card-kicker">{formatCategory(it.category)}</p>
                      <h3 className="admin-card-title">{it.title}</h3>
                    </div>
                  </div>

                  <div className="admin-meta">
                    <div>
                      <p className="admin-meta-label">Guide</p>
                      <p className="admin-meta-value">{it.creator?.username || "—"}</p>
                    </div>
                    <div>
                      <p className="admin-meta-label">Price</p>
                      <p className="admin-meta-value">{formatPrice(it.price)}</p>
                    </div>
                    <div>
                      <p className="admin-meta-label">ID</p>
                      <p className="admin-meta-value">#{it.id}</p>
                    </div>
                  </div>

                  <div className="admin-card-actions">
                    <Link to={`/itineraries/${it.id}`} className="admin-link">
                      View details
                    </Link>
                    <div className="admin-actions">
                      <button className="approve-btn" onClick={() => handleApprove(it.id)}>
                        Approve
                      </button>

                      <button className="reject-btn" onClick={() => handleReject(it.id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
