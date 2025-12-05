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

        {/* DATES */}
        <p className="date-small">
          {itinerary.startDate} → {itinerary.endDate}
        </p>

        {/* PRICE */}
        <p className="price">{itinerary.price} RON</p>

        {/* BUTTONS ONLY FOR CREATOR */}
        {canEdit && (
          <div className="actions">

            <button
              className="soft-btn edit"
              onClick={(e) => {
                e.stopPropagation(); // prevent opening details page
                onEdit();
              }}
            >
              Edit
            </button>

            <button
              className="soft-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              Delete
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
