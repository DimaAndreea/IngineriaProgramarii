import React from "react";
import { useNavigate } from "react-router-dom";
import "./ItineraryCard.css";

export default function ItineraryCard({ itinerary, canEdit, onEdit, onDelete }) {
  const navigate = useNavigate();

  const img = itinerary.imageBase64;

  const id =
    itinerary.id ||
    itinerary.itineraryId ||
    itinerary.itinerary_id;

  const status = itinerary.status?.toUpperCase();

  const displayStatus =
    status === "APPROVED" ? "Published" :
    status === "PENDING" ? "Pending" :
    status === "REJECTED" ? "Rejected" :
    status;

  const statusClass =
    status === "APPROVED" ? "status-published" :
    status === "PENDING" ? "status-pending" :
    status === "REJECTED" ? "status-rejected" :
    "";

  // RULES:
  const canEditThis = canEdit && status === "PENDING";
  const canDeleteThis = canEdit && (status === "PENDING" || status === "REJECTED");

  const openDetails = () => navigate(`/itineraries/${id}`);

  return (
    <div className="itinerary-card" onClick={openDetails}>

      {/* IMAGE */}
      <div className="card-image">
        {img ? (
          <img src={img} alt="Itinerary" />
        ) : (
          <div className="placeholder">X</div>
        )}

        {/* STATUS BADGE */}
        <span className={`status-badge ${statusClass}`}>{displayStatus}</span>
      </div>

      {/* CONTENT */}
      <div className="card-body">
        <h3 className="title">{itinerary.title}</h3>

        <p className="author">By: {itinerary.creator?.username}</p>

        <p className="date-small">
          {itinerary.startDate} → {itinerary.endDate}
        </p>

        {/* PRICE BADGE */}
        <div className="price-badge">
          {itinerary.price} RON
        </div>

        {/* ACTION BUTTONS */}
        {(canEditThis || canDeleteThis) && (
          <div className="actions">

            {canEditThis && (
              <button
                className="soft-btn edit"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                Edit
              </button>
            )}

            {canDeleteThis && (
              <button
                className="soft-btn delete"
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
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
