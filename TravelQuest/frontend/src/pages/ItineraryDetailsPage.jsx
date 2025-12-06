import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItineraryById, updateItinerary, deleteItinerary } from "../services/itineraryService";
import { useAuth } from "../context/AuthContext";
import ItineraryForm from "../components/itineraries/ItineraryForm";

import "./ItineraryDetailsPage.css";

export default function ItineraryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if logged-in user is the creator
  const isCreator =
    itinerary?.creator?.id &&
    Number(itinerary.creator.id) === Number(userId);

  const rawStatus = itinerary?.status?.toUpperCase();

  // 🔥 FRONTEND DISPLAY STATUS
  const displayStatus =
    rawStatus === "APPROVED"
      ? "Published"
      : rawStatus === "PENDING"
      ? "Pending"
      : rawStatus === "REJECTED"
      ? "Rejected"
      : rawStatus || "";

  // CSS class for badge
  const statusClass =
    rawStatus === "APPROVED"
      ? "published"
      : rawStatus === "PENDING"
      ? "pending"
      : rawStatus === "REJECTED"
      ? "rejected"
      : "";

  // Rules
  const canEditThis = isCreator && rawStatus === "PENDING";
  const canDeleteThis = isCreator && (rawStatus === "PENDING" || rawStatus === "REJECTED");

  // LOAD ITINERARY
  useEffect(() => {
    async function load() {
      try {
        const data = await getItineraryById(id);
        setItinerary(data);
      } catch (err) {
        console.error("Failed to load itinerary:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // DELETE
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const realId = itinerary.itineraryId || itinerary.id;
      await deleteItinerary(realId);
      navigate("/itineraries");
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  // UPDATE
  async function handleUpdate(values) {
    const realId = itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;

    try {
      const updated = await updateItinerary(realId, values);
      setItinerary(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!itinerary) return <div className="error">Itinerary not found.</div>;

  return (
    <div className="details-wrapper">

      {/* IMAGE */}
      <div className="details-gallery">
        <img className="gallery-main" src={itinerary.imageBase64} alt="Itinerary" />
      </div>

      {/* TITLE */}
      <h1 className="details-title">{itinerary.title}</h1>

      {/* META INFO */}
      <div className="details-meta-header">
        <span className="category-tag">{itinerary.category}</span>

        {/* 🔥 STATUS BADGE */}
        <span className={`status-tag ${statusClass}`}>
          {displayStatus}
        </span>

        <span className="author-tag">By: {itinerary.creator?.username}</span>

        <span className="date-range">
          {itinerary.startDate} → {itinerary.endDate}
        </span>
      </div>

      {/* ABOUT CARD */}
      <div className="details-card big">
        <h2>About this activity</h2>

        <p className="details-description">{itinerary.description}</p>

        <div className="info-list">
          <p><strong>Category:</strong> {itinerary.category}</p>

          {/* 🔥 DISPLAY STATUS HERE TOO */}
          <p><strong>Status:</strong> {displayStatus}</p>

          <p><strong>Price:</strong> {itinerary.price} RON</p>
        </div>

        {/* ACTIONS — EDIT & DELETE */}
        {(canEditThis || canDeleteThis) && (
          <div className="creator-action-row">

            {canEditThis && (
              <button
                className="soft-btn edit"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>
            )}

            {canDeleteThis && (
              <button
                className="soft-btn delete"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}

          </div>
        )}
      </div>

      {/* LOCATIONS GRID */}
      <h2 className="section-title">Locations</h2>

      <div className="locations-grid">
        {itinerary.locations.map((loc, index) => (
          <div className="location-card grid-card" key={index}>
            <h3>Location #{index + 1}</h3>

            <p><strong>Country:</strong> {loc.country}</p>
            <p><strong>City:</strong> {loc.city}</p>

            <p><strong>Objectives:</strong></p>
            <ul className="objectives-list">
              {loc.objectives.map((obj, i) => (
                <li key={i}>{obj.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* EDIT MODAL */}
      <ItineraryForm
        visible={showEditModal}
        initialValues={itinerary}
        onSubmit={handleUpdate}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}
