import React from "react";
import "./ItineraryCard.css";

export default function ItineraryCard({ itinerary, canEdit, onEdit, onDelete }) {
  const img = itinerary.imageBase64;

  const id =
    itinerary.id ||
    itinerary.itineraryId ||
    itinerary.itinerary_id;

  function getLocationLabel() {
    if (Array.isArray(itinerary.locations) && itinerary.locations.length > 0) {
      const first = itinerary.locations[0];
      return `${first.city}, ${first.country}`;
    }
    return "No location";
  }

  return (
    <div className="itinerary-card">
      <div className="card-image">
        {img ? (
          <img src={img} alt="Itinerary" />
        ) : (
          <div className="placeholder">X</div>
        )}
      </div>

      <div className="card-body">
        <h3 className="title">{itinerary.title}</h3>
        <p className="category">{itinerary.category}</p>
        <p className="description">{itinerary.description}</p>

        <div className="info-row">
          <span>{getLocationLabel()}</span>
          <span className="price">{itinerary.price} RON</span>
        </div>

        <div className="info-row date">
          {itinerary.startDate} → {itinerary.endDate}
        </div>

        {canEdit && (
          <div className="actions">
            <button className="soft-btn edit" onClick={onEdit}>
              Edit
            </button>

            {/* IMPORTANT!!! */}
            <button className="soft-btn delete" onClick={() => onDelete(id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
