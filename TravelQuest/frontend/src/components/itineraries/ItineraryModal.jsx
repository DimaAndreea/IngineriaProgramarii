import React from "react";
import "./ItineraryModal.css";

export default function ItineraryModal({ itinerary, onClose }) {
  if (!itinerary) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* IMAGE */}
        {itinerary.imageBase64 && (
          <img
            className="modal-image"
            src={itinerary.imageBase64}
            alt="Itinerary"
          />
        )}

        {/* TITLE */}
        <h2 className="modal-title">{itinerary.title}</h2>

        {/* STATUS */}
        <p className={`status-badge ${itinerary.status.toLowerCase()}`}>
          {itinerary.status}
        </p>

        {/* DESCRIPTION */}
        <p>
          <strong>Description:</strong> {itinerary.description}
        </p>

        {/* CATEGORY */}
        <p>
          <strong>Category:</strong> {itinerary.category}
        </p>

        {/* PRICE */}
        <p>
          <strong>Price:</strong> {itinerary.price} RON
        </p>

        {/* DATES */}
        <p>
          <strong>Dates:</strong>{" "}
          {itinerary.startDate} → {itinerary.endDate}
        </p>

        {/* LOCATIONS */}
        <div className="modal-section">
          <h3>Locations</h3>

          {itinerary.locations.map((loc, index) => (
            <div className="location-block" key={loc.id || index}>
              <p><strong>Location #{index + 1}</strong></p>
              <p><strong>Country:</strong> {loc.country}</p>
              <p><strong>City:</strong> {loc.city}</p>

              {loc.objectives?.length > 0 && (
                <>
                  <strong>Objectives:</strong>
                  <ul>
                    {loc.objectives.map((obj) => (
                      <li key={obj.id}>{obj.name}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
