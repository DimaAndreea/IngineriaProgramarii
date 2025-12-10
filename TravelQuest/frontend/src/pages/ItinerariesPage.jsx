import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import ItineraryCard from "../components/itineraries/ItineraryCard";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import FiltersSidebar from "../components/itineraries/FiltersSidebar";

import { useAuth } from "../context/AuthContext";
import {
  createItinerary,
  updateItinerary,
  deleteItinerary,
  filterItineraries,
} from "../services/itineraryService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();
  const isGuide = role === "guide";
  const isAdmin = role === "admin";
  const isTourist = role === "tourist";

  const locationURL = useLocation();
  const globalSearch =
    new URLSearchParams(locationURL.search).get("search") || "";

  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------- FILTER STATE (UI) -----------------------------------
  const [filters, setFilters] = useState({
    categories: {
      all: true,
      mine: false,
      approved: false,
      pending: false,
      rejected: false,
      others: false,
    },

    dates: { startFrom: "", startTo: "" },

    price: { min: 0, max: 50000 },

    category: {
      cultural: false,
      adventure: false,
      citybreak: false,
      entertainment: false,
      exotic: false,
    },

    sort: "none",
    rating: "",
    searchGlobal: "",
  });

  // inject global search (from URL) in filters.searchGlobal
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchGlobal: globalSearch }));
  }, [globalSearch]);

  // ----------------------------------- LOAD FROM BACKEND (FILTER+SORT) -----------------------------------
  const loadItineraries = useCallback(
    async currentFilters => {
      // dacă nu avem rol (nu e logat), nu încărcăm nimic
      if (!role) {
        setItineraries([]);
        return;
      }

      // pentru ghid avem nevoie sigur de userId
      if (isGuide && !userId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let filterPayload = {
          ...currentFilters,
          guideId: null,
        };

        // pentru turist forțăm să vadă DOAR itinerarii aprobate,
        // indiferent de combinația de statusuri din UI
        if (isTourist) {
          filterPayload = {
            ...filterPayload,
            categories: {
              ...(filterPayload.categories || {}),
              all: false,
              mine: false,
              approved: true,
              pending: false,
              rejected: false,
              others: false,
            },
          };
        }

        const result = await filterItineraries(
          filterPayload,
          Number(userId || 0)
        );

        setItineraries(result || []);
      } catch (err) {
        console.error("Failed to load itineraries:", err);
        setError(err.message || "Failed to load itineraries.");
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    },
    [role, isGuide, isTourist, userId]
  );

  // reload itineraries when changes in filters
  useEffect(() => {
    loadItineraries(filters);
  }, [filters, loadItineraries]);

  // ----------------------------------- CRUD (GHID) -----------------------------------
  async function handleCreate(values) {
    const payload = { ...values, guideId: Number(userId), status: "PENDING" };
    await createItinerary(payload);
    await loadItineraries(filters);
  }

  async function handleUpdate(values) {
    const id = values.id || values.itineraryId;
    await updateItinerary(id, values);
    await loadItineraries(filters);
  }

  async function handleDelete(id) {
    await deleteItinerary(id);
    await loadItineraries(filters);
  }

  // ----------------------------------- RENDER -----------------------------------
  return (
    <div className="itineraries-layout">
      {(isGuide || isAdmin || isTourist) && (
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          role={role}
        />
      )}

      <div className="itineraries-page-container">
        {/* CREATE BUTTON */}
        {isGuide && (
          <div className="top-align-wrapper">
            <div className="mini-create-box" onClick={() => setShowModal(true)}>
              <span className="mini-create-text">
                Start planning a new itinerary...
              </span>
              <button className="mini-create-btn">Create</button>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && <div className="error-box">{error}</div>}

        {/* LOADING */}
        {loading && (
          <div className="loading-box">
            <span>Loading itineraries...</span>
          </div>
        )}

        {/* RESULT GRID */}
        {!loading && (
          <div className="cards-grid">
            {itineraries.length === 0 && (
              <div className="no-results">
                <strong>No itineraries match your filters.</strong>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
            )}

            {itineraries.map(it => (
              <ItineraryCard
                key={it.id}
                itinerary={it}
                canEdit={isGuide && it.creator.id === Number(userId)}
                onEdit={() => {
                  setSelected(it);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(it.id)}
                canParticipate={isTourist}
              />
            ))}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
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
    </div>
  );
}
