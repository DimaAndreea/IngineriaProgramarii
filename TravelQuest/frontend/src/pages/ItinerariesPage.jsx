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

  useEffect(() => {
    if (!userId) return;

    getGuideItineraries(userId)
      .then((data) => {
        console.log("BACKEND → FRONTEND DATA:", data);
        setItineraries(data);
      })
      .catch((err) => console.error("Failed to load itineraries:", err));
  }, [userId]);

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

  async function handleUpdate(values) {
    try {
      const updated = await updateItinerary(values.id, values);
      setItineraries((prev) =>
        prev.map((it) => (it.id === values.id ? updated : it))
      );
      setSelected(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update itinerary.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((it) => it.id !== id));
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

      <div className="cards-grid">
        {itineraries.length === 0 && (
          <p className="empty-text">No itineraries available.</p>
        )}

        {itineraries.map((it) => (
          <ItineraryCard
            key={it.id}
            itinerary={it}
            canEdit={isGuide && it.creator?.id === Number(userId)}
            onEdit={() => {
              setSelected(it);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isGuide && (
        <ItineraryForm
          visible={showModal}
          initialValues={selected}
          onSubmit={
            selected
              ? (values) => handleUpdate({ ...values, id: selected.id })
              : handleCreate
          }
          onClose={() => {
            setShowModal(false);
            setSelected(null);
          }}
        />

      )}
    </div>
  );
}
