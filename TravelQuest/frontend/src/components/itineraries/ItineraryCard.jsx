import React from "react";
import "./ItineraryCard.css";

function getStatusInfo(statusFromBackend) {
    const raw = (statusFromBackend || "pending").toLowerCase();

    switch (raw) {
        case "approved":
            return { cssClass: "approved", label: "APPROVED" };
        case "rejected":
            return { cssClass: "rejected", label: "REJECTED" };
        case "pending":
        default:
            return { cssClass: "pending", label: "PENDING APPROVAL" };
    }
}

function getLocationLabel(itinerary) {
    // locations: [{ city, country, objectives: [] }]
    if (Array.isArray(itinerary.locations) && itinerary.locations.length > 0) {
        const first = itinerary.locations[0];
        const city = first.city || "";
        const country = first.country || "";

        let base = "";
        if (city && country) base = `${city}, ${country}`;
        else base = city || country || "";

        if (itinerary.locations.length > 1) {
            base += ` + ${itinerary.locations.length - 1} more`;
        }

        return base || "Multiple locations";
    }

    if (itinerary.location) {
        return itinerary.location;
    }

    return "No location";
}

export default function ItineraryCard({ itinerary, canEdit, onEdit, onDelete }) {
    const img = itinerary.image_base64;
    const { cssClass, label } = getStatusInfo(itinerary.status);
    const locationLabel = getLocationLabel(itinerary);

    return (
        <div className="itinerary-card">

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
                <h3 className="title">{itinerary.title}</h3>

                <p className="category">{itinerary.category}</p>
                <p className="description">{itinerary.description}</p>

                <div className="info-row">
                    <span>{locationLabel}</span>
                    <span className="price">{itinerary.price} RON</span>
                </div>

                <div className="info-row date">
                    {itinerary.start_date} → {itinerary.end_date}
                </div>

                {/* STATUS – doar din backend (admin approval) */}
                <div className={`status-badge ${cssClass}`}>
                    {label}
                </div>

                {/* ACTION BUTTONS */}
                {canEdit && (
                    <div className="actions">
                        <button className="soft-btn edit" onClick={onEdit}>
                            Edit
                        </button>
                        <button
                            className="soft-btn delete"
                            onClick={() => onDelete(itinerary.id)}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
