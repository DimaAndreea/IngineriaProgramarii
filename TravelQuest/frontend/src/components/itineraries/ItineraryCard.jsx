import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinItinerary } from "../../services/itineraryService";
import { useAuth } from "../../context/AuthContext";
import { isJoined, markJoined } from "../../services/enrollmentStorage";
import "./ItineraryCard.css";

export default function ItineraryCard({
  itinerary,
  canEdit,
  onEdit,
  onDelete,
  canParticipate,
}) {
  const navigate = useNavigate();
  const { userId, role } = useAuth();

  const isTourist = role === "tourist";
  const img = itinerary.imageBase64;

  const id =
    itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;

  const status = itinerary.status?.toUpperCase();

  const displayStatus =
    status === "APPROVED"
      ? "Published"
      : status === "PENDING"
      ? "Pending"
      : status === "REJECTED"
      ? "Rejected"
      : status;

  const statusClass =
    status === "APPROVED"
      ? "status-published"
      : status === "PENDING"
      ? "status-pending"
      : status === "REJECTED"
      ? "status-rejected"
      : "";

  const firstLocation =
    Array.isArray(itinerary.locations) && itinerary.locations.length > 0
      ? itinerary.locations[0]
      : null;

  const canEditThis = canEdit && status === "PENDING";
  const canDeleteThis =
    canEdit && (status === "PENDING" || status === "REJECTED");

  const canParticipateThis = canParticipate && status === "APPROVED";

  const openDetails = () => navigate(`/itineraries/${id}`);

  // ✅ memorie “already joined”
  const [alreadyJoined, setAlreadyJoined] = useState(() =>
    isJoined(userId, id)
  );

  // când se schimbă user-ul sau cardul, recitim din storage
  useEffect(() => {
    setAlreadyJoined(isJoined(userId, id));
  }, [userId, id]);

  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState("");
  const [joinErr, setJoinErr] = useState("");

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    if (!isTourist) return;
    if (!canParticipateThis) return;
    if (alreadyJoined) return;

    setJoinLoading(true);
    setJoinMsg("");
    setJoinErr("");

    try {
      const msg = await joinItinerary(id);

      // ✅ memorează imediat
      markJoined(userId, id);
      setAlreadyJoined(true);

      setJoinMsg(msg || "Tour successfully joined!");
    } catch (err) {
      const msg = err?.message || "Failed to join the tour";

      // dacă backend zice “already joined”, tot îl marcăm local
      if (msg.toLowerCase().includes("already")) {
        markJoined(userId, id);
        setAlreadyJoined(true);
        setJoinErr("");
      } else {
        setJoinErr(msg);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="itinerary-card" onClick={openDetails}>
      {/* IMAGE */}
      <div className="card-image">
        {img ? <img src={img} alt="Itinerary" /> : <div className="placeholder">X</div>}

        {/* STATUS BADGE (doar pt ghid/admin) */}
        {!canParticipate && (
          <span className={`status-badge ${statusClass}`}>
            {displayStatus}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="card-body">
        <h3 className="title">{itinerary.title}</h3>

        <div className="row-two-cols">
          <span className="category-pill">{itinerary.category}</span>
          <span className="author">By: {itinerary.creator?.username}</span>
        </div>

        <div className="meta-grid">
          {firstLocation && (
            <div className="meta-item">
              <span className="meta-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </span>
              <span className="meta-text">
                {firstLocation.city}, {firstLocation.country}
              </span>
            </div>
          )}

          <div className="meta-item">
            <span className="meta-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span className="meta-text">
              {itinerary.startDate} → {itinerary.endDate}
            </span>
          </div>
        </div>

        <div className="price-badge">{itinerary.price} RON</div>

        {/* JOIN BUTTON – turist */}
        {canParticipateThis && (
          <div className="actions">
            {!alreadyJoined ? (
              <button
                className="soft-btn primary"
                onClick={handleJoinClick}
                disabled={joinLoading}
              >
                {joinLoading ? "Joining..." : "Join tour"}
              </button>
            ) : (
              <button
                className="soft-btn disabled"
                type="button"
                disabled
                onClick={(e) => e.stopPropagation()}
              >
                Already joined
              </button>
            )}
          </div>
        )}

        {/* feedback sub buton (opțional, dar arată bine) */}
        {canParticipateThis && joinMsg && (
          <div className="card-join-msg success" onClick={(e) => e.stopPropagation()}>
            {joinMsg}
          </div>
        )}
        {canParticipateThis && joinErr && (
          <div className="card-join-msg error" onClick={(e) => e.stopPropagation()}>
            {joinErr}
          </div>
        )}

        {/* EDIT / DELETE – ghid */}
        {(canEditThis || canDeleteThis) && (
          <div className="actions actions-guide">
            {canEditThis && (
              <button
                className="soft-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </button>
            )}

            {canDeleteThis && (
              <button
                className="soft-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
