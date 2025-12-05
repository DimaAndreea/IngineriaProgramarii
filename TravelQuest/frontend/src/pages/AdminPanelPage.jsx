import React, { useEffect, useState } from "react";
import {
  getPendingItineraries,
  approveItinerary,
  rejectItinerary,
} from "../services/itineraryService";
import "./AdminPanelPage.css";

export default function AdminPanelPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="admin-loading">Loading pending itineraries...</p>;

  return (
    <div className="admin-wrapper">
      <h1 className="admin-title">Pending Itineraries</h1>

      {pending.length === 0 ? (
        <p className="empty-msg">No itineraries pending approval.</p>
      ) : (
        <div className="admin-list">
          {pending.map((it) => (
            <div key={it.id} className="admin-card">
              <div className="admin-card-body">
                <h3>{it.title}</h3>
                <p><strong>Guide:</strong> {it.creator?.username}</p>
                <p><strong>Category:</strong> {it.category}</p>
                <p><strong>Price:</strong> {it.price} RON</p>
                <p><strong>Status:</strong> {it.status}</p>
              </div>

              <div className="admin-actions">
                <button className="approve-btn" onClick={() => handleApprove(it.id)}>
                  Approve
                </button>

                <button className="reject-btn" onClick={() => handleReject(it.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
