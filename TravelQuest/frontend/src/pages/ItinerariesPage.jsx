import React, { useState, useEffect } from "react";
import ItineraryCard from "../components/itineraries/ItineraryCard";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import { useAuth } from "../context/AuthContext";
import {
  getGuideItineraries,
  createItinerary,
  updateItinerary,
  deleteItinerary,
} from "../services/itineraryService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();
  const isGuide = role === "guide";

  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // LOAD ITINERARIES
  useEffect(() => {
    if (!userId) return;

    getGuideItineraries(userId)
      .then((data) => {
        console.log("BACKEND → FRONTEND DATA:", data);
        setItineraries(data);
      })
      .catch((err) => console.error("Failed to load itineraries:", err));
  }, [userId]);

  // CREATE
  async function handleCreate(values) {
    const payload = {
      ...values,
      guideId: Number(userId),
      status: "PENDING",
    };

    try {
      const created = await createItinerary(payload);
      setItineraries((prev) => [...prev, created]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create itinerary.");
    }
  }

  // UPDATE
  async function handleUpdate(values) {
    const id =
      values.id || values.itineraryId || values.itinerary_id;

    try {
      const updated = await updateItinerary(id, values);
      setItineraries((prev) =>
        prev.map((it) =>
          (it.id || it.itineraryId || it.itinerary_id) === id ? updated : it
        )
      );
      setSelected(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update itinerary.");
    }
  }

  // DELETE (FIXED!)
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      await deleteItinerary(id);
      setItineraries((prev) =>
        prev.filter(
          (it) =>
            (it.id || it.itineraryId || it.itinerary_id) !== id
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  }

  return (
    <div className="itineraries-page-container">
      {isGuide && (
        <div className="mini-create-box" onClick={() => setShowModal(true)}>
          <span className="mini-create-text">Start planning a new itinerary...</span>
          <button className="mini-create-btn">Create</button>
        </div>
      )}

      {/* CARDS */}
      <div className="cards-grid">
        {itineraries.length === 0 && (
          <p className="empty-text">No itineraries available.</p>
        )}

        {itineraries.map((it) => {
          const itineraryId = it.id || it.itineraryId || it.itinerary_id;

          return (
            <ItineraryCard
              key={itineraryId}
              itinerary={it}
              canEdit={isGuide && it.creator?.id === Number(userId)}
              onEdit={() => {
                setSelected(it);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(itineraryId)}
            />
          );
        })}
      </div>

      {isGuide && (
        <ItineraryForm
          visible={showModal}
          initialValues={selected}
          onSubmit={selected ? handleUpdate : handleCreate}
          onClose={() => {
            setShowModal(false);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
