import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  joinItinerary,
} from "../services/itineraryService";
import { useAuth } from "../context/AuthContext";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import "./ItineraryDetailsPage.css";

import { isJoined, markJoined } from "../services/enrollmentStorage"; // ✅

export default function ItineraryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const isTourist = role === "tourist";

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [joinMessage, setJoinMessage] = useState("");
  const [joinError, setJoinError] = useState("");

  const realId = useMemo(() => Number(id), [id]);

  // ✅ pornește din memorie (localStorage), nu din presupuneri
  const [alreadyJoined, setAlreadyJoined] = useState(() =>
    isJoined(userId, realId)
  );

  // dacă userId se încarcă după mount, resetează din storage
  useEffect(() => {
    setAlreadyJoined(isJoined(userId, realId));
  }, [userId, realId]);

  const isCreator =
    itinerary?.creator?.id && Number(itinerary.creator.id) === Number(userId);

  const rawStatus = itinerary?.status?.toUpperCase();
  const displayStatus =
    rawStatus === "APPROVED"
      ? "Published"
      : rawStatus === "PENDING"
      ? "Pending"
      : rawStatus === "REJECTED"
      ? "Rejected"
      : rawStatus || "";

  const statusClass =
    rawStatus === "APPROVED"
      ? "published"
      : rawStatus === "PENDING"
      ? "pending"
      : rawStatus === "REJECTED"
      ? "rejected"
      : "";

  const canEditThis = isCreator && rawStatus === "PENDING";
  const canDeleteThis =
    isCreator && (rawStatus === "PENDING" || rawStatus === "REJECTED");

  // ======================
  // LOAD ITINERARY
  // ======================
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await getItineraryById(id);
        if (!alive) return;
        setItinerary(data);
      } catch (err) {
        console.error("Failed to load itinerary:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  // ======================
  // DELETE
  // ======================
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const real = itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;
      await deleteItinerary(real);
      navigate("/itineraries");
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  // ======================
  // UPDATE
  // ======================
  async function handleUpdate(values) {
    const real = itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;

    try {
      const updated = await updateItinerary(real, values);
      setItinerary(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  }

  // ======================
  // JOIN TOUR (TOURIST)
  // ======================
  async function handleJoin() {
    const real = itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;

    try {
      const message = await joinItinerary(real);

      // ✅ memorează local imediat
      markJoined(userId, real);
      setAlreadyJoined(true);

      setJoinMessage(message || "Tour successfully joined!");
      setJoinError("");
    } catch (err) {
      const msg = err?.message || "";

      // dacă backend-ul zice “already joined”, memorează și atunci
      if (msg.toLowerCase().includes("already")) {
        markJoined(userId, real);
        setAlreadyJoined(true);
        setJoinError("");
        setJoinMessage("");
      } else {
        setJoinError(msg || "Failed to join the tour");
        setJoinMessage("");
      }
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!itinerary) return <div className="error">Itinerary not found.</div>;

  return (
    <div className="details-wrapper">
      {/* IMAGE */}
      <div className="details-gallery">
        <img
          className="gallery-main"
          src={itinerary.imageBase64}
          alt="Itinerary"
        />
      </div>

      {/* TITLE */}
      <h1 className="details-title">{itinerary.title}</h1>

      {/* META INFO */}
      <div className="details-meta-header">
        <span className="category-tag">{itinerary.category}</span>

        {!isTourist && (
          <span className={`status-tag ${statusClass}`}>{displayStatus}</span>
        )}

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
          <p>
            <strong>Category:</strong> {itinerary.category}
          </p>
          {!isTourist && (
            <p>
              <strong>Status:</strong> {displayStatus}
            </p>
          )}
          <p>
            <strong>Price:</strong> {itinerary.price} RON
          </p>
        </div>

        {/* JOIN / ALREADY JOINED — TOURIST */}
        {isTourist && rawStatus === "APPROVED" && (
          <div className="creator-action-row" style={{ marginTop: "20px" }}>
            {!alreadyJoined ? (
              <button
                className="soft-btn primary"
                onClick={handleJoin}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Join tour
              </button>
            ) : (
              <button
                className="soft-btn disabled"
                type="button"
                disabled
                style={{ width: "100%", justifyContent: "center" }}
              >
                Already joined
              </button>
            )}

            {joinMessage && <p className="join-success">{joinMessage}</p>}
            {joinError && <p className="join-error">{joinError}</p>}
          </div>
        )}

        {/* ACTIONS — EDIT & DELETE (creator) */}
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
              <button className="soft-btn delete" onClick={handleDelete}>
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
            <p>
              <strong>Country:</strong> {loc.country}
            </p>
            <p>
              <strong>City:</strong> {loc.city}
            </p>
            <p className="objectives-label">
              <strong>Objectives:</strong>
            </p>
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
