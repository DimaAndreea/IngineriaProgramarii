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

  // RULES:
  const canEditThis =
    canEdit && status === "PENDING";

  const canDeleteThis =
    canEdit && (status === "PENDING" || status === "REJECTED");

  // When clicking the card → go to full page details
  const openDetails = () => {
    navigate(`/itineraries/${id}`);
  };

  return (
    <div className="itinerary-card" onClick={openDetails}>
      
      {/* IMAGE */}
      <div className="card-image">
        {img ? (
          <img src={img} alt="Itinerary" />
        ) : (
          <div className="placeholder">X</div>
        )}
      </div>

      {/* CONTENT */}
      <div className="card-body">

        {/* TITLE */}
        <h3 className="title">{itinerary.title}</h3>

        <p className="author">By: {itinerary.creator?.username}</p>

        {/* DATES */}
        <p className="date-small">
          {itinerary.startDate} → {itinerary.endDate}
        </p>

        {/* PRICE */}
        <p className="price">{itinerary.price} RON</p>

        {/* ACTION BUTTONS BASED ON STATUS */}
        {(canEditThis || canDeleteThis) && (
          <div className="actions">

            {/* EDIT only if PENDING */}
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

            {/* DELETE if PENDING or REJECTED */}
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
