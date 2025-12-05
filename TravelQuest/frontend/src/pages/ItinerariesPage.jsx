import React, { useState, useEffect } from "react";
import ItineraryCard from "../components/itineraries/ItineraryCard";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import { useAuth } from "../context/AuthContext";

import {
  getGuideItineraries,
  getPublicItineraries,
  createItinerary,
  updateItinerary,
  deleteItinerary,
} from "../services/itineraryService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();

  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isGuide = role === "guide";
  const isAdmin = role === "admin";

  // ----------------------------- LOAD ITINERARIES BASED ON ROLE -----------------------------
  useEffect(() => {
    if (!role || !userId) return;

    async function load() {
      try {
        if (isGuide) {

          const mine = await getGuideItineraries(userId);  
          const approved = await getPublicItineraries();   

          const combined = [
            ...mine,
            ...approved.filter(a => a.creator.id !== Number(userId))
          ];

          setItineraries(combined);

        } else {
          const approved = await getPublicItineraries();
          setItineraries(approved);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [role, userId]);


  // ----------------------------- CREATE -----------------------------
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

  // ----------------------------- UPDATE -----------------------------
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

  // ----------------------------- DELETE -----------------------------
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

      {/* GUIDE — CREATE NEW ITINERARY */}
      {isGuide && (
        <div className="mini-create-box" onClick={() => setShowModal(true)}>
          <span className="mini-create-text">Start planning a new itinerary...</span>
          <button className="mini-create-btn">Create</button>
        </div>
      )}

      {/* ITINERARY CARD GRID */}
      <div className="cards-grid">
        {itineraries.length === 0 && (
          <p className="empty-text">No itineraries available.</p>
        )}

        {itineraries.map((it) => {
          const itineraryId =
            it.id || it.itineraryId || it.itinerary_id;

          return (
            <ItineraryCard
              key={itineraryId}
              itinerary={it}
              canEdit={
                isGuide &&
                it.creator?.id === Number(userId)
              }
              onEdit={() => {
                setSelected(it);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(itineraryId)}
            />
          );
        })}
      </div>

      {/* GUIDE — CREATE/EDIT MODAL */}
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
