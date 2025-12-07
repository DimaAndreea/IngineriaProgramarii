import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import ItineraryCard from "../components/itineraries/ItineraryCard";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import FiltersSidebar from "../components/itineraries/FiltersSidebar";

import { useAuth } from "../context/AuthContext";
import {
  getGuideItineraries,
  getPublicItineraries,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  getAllItineraries,   // 🔥 nou
} from "../services/itineraryService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();
  const isGuide = role === "guide";
  const isAdmin = role === "admin";

  const locationURL = useLocation();
  const globalSearch = new URLSearchParams(locationURL.search).get("search") || "";

  const [allData, setAllData] = useState([]);
  const [itineraries, setItineraries] = useState([]);

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ----------------------------------- FILTER STATE -----------------------------------
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

  // Inject global search
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchGlobal: globalSearch }));
  }, [globalSearch]);

  // ----------------------------------- LOAD DATA (GUIDE + ADMIN) -----------------------------------
  useEffect(() => {
    async function load() {
      try {
        // GHID → propriile + public ale altora (cum era înainte)
        if (isGuide && userId) {
          const mine = await getGuideItineraries(userId);
          const approved = await getPublicItineraries();

          const combined = [
            ...mine,
            ...approved.filter(a => a.creator.id !== Number(userId)),
          ];

          setAllData(combined);
          setItineraries(combined);
        }

        // ADMIN → toate itinerariile
        if (isAdmin) {
          const all = await getAllItineraries();
          setAllData(all);
          setItineraries(all);
        }
      } catch (err) {
        console.error("Failed to load itineraries:", err);
      }
    }

    if (isGuide || isAdmin) {
      load();
    }
  }, [isGuide, isAdmin, userId]);

  // ----------------------------------- MASTER FILTER -----------------------------------
  useEffect(() => {
    let filtered = [...allData];
    const cat = filters.categories;

    // CATEGORY (owner/status) FILTER
    if (!cat.all) {
      filtered = filtered.filter(it => {
        if (cat.mine && it.creator.id !== Number(userId)) return false;
        if (cat.approved && it.status.toUpperCase() !== "APPROVED") return false;
        if (cat.pending && !(it.status.toUpperCase() === "PENDING" && it.creator.id === Number(userId))) return false;
        if (cat.rejected && !(it.status.toUpperCase() === "REJECTED" && it.creator.id === Number(userId))) return false;
        if (cat.others && !(it.creator.id !== Number(userId) && it.status.toUpperCase() === "APPROVED")) return false;
        return true;
      });
    }

    // DATE RANGE
    if (filters.dates.startFrom) {
      filtered = filtered.filter(it => new Date(it.startDate) >= new Date(filters.dates.startFrom));
    }
    if (filters.dates.startTo) {
      filtered = filtered.filter(it => new Date(it.endDate) <= new Date(filters.dates.startTo));
    }

    // PRICE RANGE
    filtered = filtered.filter(it =>
        Number(it.price) >= filters.price.min &&
        Number(it.price) <= filters.price.max
    );

    // CATEGORY TYPE FILTER
    const selectedCats = Object.keys(filters.category).filter(key => filters.category[key]);

    if (selectedCats.length > 0) {
      filtered = filtered.filter(it =>
          selectedCats.includes(it.category?.toLowerCase())
      );
    }

    // GLOBAL SEARCH
    if (filters.searchGlobal.trim()) {
      const term = filters.searchGlobal.toLowerCase();

      filtered = filtered.filter(it =>
          it.title.toLowerCase().includes(term) ||
          it.creator.username.toLowerCase().includes(term) ||
          it.locations.some(loc =>
              loc.country.toLowerCase().includes(term) ||
              loc.city.toLowerCase().includes(term)
          )
      );
    }

    // RATING
    if (filters.rating) {
      filtered = filtered.filter(it => (it.rating || 0) >= Number(filters.rating));
    }

    // SORT
    if (filters.sort === "priceAsc") {
      filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (filters.sort === "priceDesc") {
      filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    }

    setItineraries(filtered);

  }, [filters, allData, userId]);

  // ----------------------------------- CRUD (GHID) -----------------------------------
  async function handleCreate(values) {
    const payload = { ...values, guideId: Number(userId), status: "PENDING" };
    const created = await createItinerary(payload);
    setAllData(prev => [...prev, created]);
  }

  async function handleUpdate(values) {
    const id = values.id || values.itineraryId;
    const updated = await updateItinerary(id, values);
    setAllData(prev => prev.map(it => (it.id === id ? updated : it)));
  }

  async function handleDelete(id) {
    await deleteItinerary(id);
    setAllData(prev => prev.filter(it => it.id !== id));
  }

  // ----------------------------------- RENDER -----------------------------------
  return (
      <div className="itineraries-layout">

        {(isGuide || isAdmin) && (
            <FiltersSidebar
                filters={filters}
                setFilters={setFilters}
                role={role}         // 🔥 trimitem rolul ca să ascundem "My / Other guides" pentru admin
            />
        )}

        <div className="itineraries-page-container">

          {/* CREATE BUTTON – DOAR PENTRU GHID */}
          {isGuide && (
              <div className="top-align-wrapper">
                <div className="mini-create-box" onClick={() => setShowModal(true)}>
                  <span className="mini-create-text">Start planning a new itinerary...</span>
                  <button className="mini-create-btn">Create</button>
                </div>
              </div>
          )}

          {/* RESULT GRID */}
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
                    canEdit={isGuide && it.creator.id === Number(userId)}   // admin nu editează aici
                    onEdit={() => { setSelected(it); setShowModal(true); }}
                    onDelete={() => handleDelete(it.id)}
                />
            ))}
          </div>

          {/* FORMULAR CREATE / EDIT – DOAR GHID */}
          {isGuide && (
              <ItineraryForm
                  visible={showModal}
                  initialValues={selected}
                  onSubmit={selected ? handleUpdate : handleCreate}
                  onClose={() => { setShowModal(false); setSelected(null); }}
              />
          )}

        </div>
      </div>
  );
}
