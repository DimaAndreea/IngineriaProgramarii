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
} from "../services/itineraryService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();
  const isGuide = role === "guide";

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

  // Inject global search into filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchGlobal: globalSearch }));
  }, [globalSearch]);

  // ----------------------------------- LOAD DATA -----------------------------------
  useEffect(() => {
    async function load() {
      if (!userId || !isGuide) return;

      const mine = await getGuideItineraries(userId);
      const approved = await getPublicItineraries();

      const combined = [
        ...mine,
        ...approved.filter(a => a.creator.id !== Number(userId)),
      ];

      setAllData(combined);
      setItineraries(combined);
    }

    if (isGuide) load();
  }, [isGuide, userId]);

  // ----------------------------------- MASTER FILTER -----------------------------------
  useEffect(() => {
    let filtered = [...allData];
    const cat = filters.categories;

    // OWNER / STATUS FILTERS
    if (!cat.all) {
      filtered = filtered.filter(it => {
        if (cat.mine && it.creator.id !== Number(userId)) return false;
        if (cat.approved && it.status.toUpperCase() !== "APPROVED") return false;
        if (cat.pending && !(it.status === "PENDING" && it.creator.id === Number(userId))) return false;
        if (cat.rejected && !(it.status === "REJECTED" && it.creator.id === Number(userId))) return false;
        if (cat.others && !(it.creator.id !== Number(userId) && it.status === "APPROVED")) return false;
        return true;
      });
    }

    // DATE RANGE
    if (filters.dates.startFrom) {
      filtered = filtered.filter(it => new Date(it.startDate) >= new Date(filters.dates.startFrom));
    }
    if (filters.dates.startTo) {
      filtered = filtered.filter(it => new Date(it.startDate) <= new Date(filters.dates.startTo));
    }

    // PRICE RANGE
    filtered = filtered.filter(it =>
      Number(it.price) >= filters.price.min &&
      Number(it.price) <= filters.price.max
    );

    // CATEGORY TYPE FILTER (cultural, adventure, etc.)
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

    // RATING FILTER
    if (filters.rating) {
      filtered = filtered.filter(it => (it.rating || 0) >= Number(filters.rating));
    }

    // SORTING
    if (filters.sort === "priceAsc") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (filters.sort === "priceDesc") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setItineraries(filtered);

  }, [filters, allData, userId]);

  // ----------------------------------- CRUD -----------------------------------
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

      {isGuide && <FiltersSidebar filters={filters} setFilters={setFilters} />}

      <div className="itineraries-page-container">

        {/* CREATE BUTTON */}
        {isGuide && (
          <div className="top-align-wrapper">
            <div className="mini-create-box" onClick={() => setShowModal(true)}>
              <span className="mini-create-text">Start planning a new itinerary...</span>
              <button className="mini-create-btn">Create</button>
            </div>
          </div>
        )}

        {/* GRID */}
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
              onEdit={() => { setSelected(it); setShowModal(true); }}
              onDelete={() => handleDelete(it.id)}
            />
          ))}
        </div>

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
