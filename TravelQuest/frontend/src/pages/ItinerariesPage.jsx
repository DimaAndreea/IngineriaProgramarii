import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ItineraryCard from "../components/itineraries/ItineraryCard";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import FiltersSidebar from "../components/itineraries/FiltersSidebar";
import PaymentModal from "../components/common/PaymentModal";

import { useAuth } from "../context/AuthContext";
import {
  createItinerary,
  updateItinerary,
  deleteItinerary,
  filterItineraries,
} from "../services/itineraryService";
import { getWalletBalance, purchaseItinerary, addFunds } from "../services/walletService";

import "./ItinerariesPage.css";

export default function ItinerariesPage() {
  const { role, userId } = useAuth();
  const isGuide = role === "guide";
  const isAdmin = role === "admin";
  const isTourist = role === "tourist";

  const locationURL = useLocation();
  const navigate = useNavigate();
  
  const globalSearch =
    new URLSearchParams(locationURL.search).get("search") || "";

  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedItineraryForPayment, setSelectedItineraryForPayment] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [joinMessage, setJoinMessage] = useState("");
    const [joinError, setJoinError] = useState("");
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [addFundsAmount, setAddFundsAmount] = useState("");

    // dacă venim din profile cu state.openEdit, deschidem modalul direct
  useEffect(() => {
    const editIt = locationURL.state?.openEdit;
    if (editIt) {
      setSelected(editIt);
      setShowModal(true);

      // curățăm state-ul ca să nu se redeschidă la refresh/back
      navigate("/itineraries", { replace: true, state: null });
    }
  }, [locationURL.state, navigate]);

  
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
  
    // Load wallet balance for tourists
    useEffect(() => {
      if (!isTourist || !userId) return;
    
      let alive = true;
      async function loadBalance() {
        try {
          const balance = await getWalletBalance();
          if (alive) setWalletBalance(balance);
        } catch (err) {
          console.error("Failed to load wallet balance:", err);
        }
      }
    
      loadBalance();
      return () => { alive = false; };
    }, [isTourist, userId]);

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
  
    // ----------------------------------- PAYMENT & JOIN (TOURIST) -----------------------------------
    function handleJoinClick(itinerary) {
      setJoinMessage("");
      setJoinError("");
      setSelectedItineraryForPayment(itinerary);
      setShowPaymentModal(true);
    }
  
    async function handlePurchaseConfirm() {
      if (!selectedItineraryForPayment) return;
    
      const itinId = selectedItineraryForPayment.id || selectedItineraryForPayment.itineraryId;
      const price = Number(selectedItineraryForPayment.price || 0);
    
      try {
        // Process payment
        const result = await purchaseItinerary(itinId, price);
      
        // Update local wallet balance
        setWalletBalance(result.balance);
      
        setShowPaymentModal(false);
        setSelectedItineraryForPayment(null);
        setJoinMessage(result.message || "Payment successful! You have joined this itinerary.");
        setJoinError("");
      
        // Reload itineraries to update UI
        await loadItineraries(filters);
      } catch (err) {
        setShowPaymentModal(false);
        setSelectedItineraryForPayment(null);
        setJoinError(err?.message || "Failed to complete purchase");
        setJoinMessage("");
      }
    }

  // ----------------------------------- RENDER -----------------------------------
  return (
    <div className="itineraries-page">
      {/* Animated light circles */}
      <div className="light-circle circle-1"></div>
      <div className="light-circle circle-2"></div>
      <div className="light-circle circle-3"></div>
      <div className="light-circle circle-4"></div>
      <div className="light-circle circle-5"></div>

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
        
          {/* JOIN SUCCESS/ERROR MESSAGES */}
          {joinMessage && (
            <div className="success-box" style={{ margin: "10px 0", padding: "12px", background: "#d1fae5", borderRadius: "8px", color: "#065f46", fontWeight: 600 }}>
              {joinMessage}
            </div>
          )}
          {joinError && (
            <div className="error-box" style={{ margin: "10px 0" }}>
              {joinError}
            </div>
          )}

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
                  onJoin={() => handleJoinClick(it)}
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
        
          {/* PAYMENT MODAL */}
          {isTourist && (
            <PaymentModal
              open={showPaymentModal}
              onClose={() => {
                setShowPaymentModal(false);
                setSelectedItineraryForPayment(null);
              }}
              onConfirm={handlePurchaseConfirm}
              itinerary={selectedItineraryForPayment}
              currentBalance={walletBalance}
              onAddFundsClick={() => {
                setShowPaymentModal(false);
                setShowAddFundsModal(true);
              }}
            />
          )}

          {/* ADD FUNDS MODAL - Quick add from payment modal */}
          {isTourist && showAddFundsModal && (
            <div className="modal-overlay" onClick={() => setShowAddFundsModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Funds to Wallet</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowAddFundsModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <p>Enter the amount you want to add to your wallet:</p>
                  <input
                    type="number"
                    min="1"
                    max="999999"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="Amount (RON)"
                    className="modal-input"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-cancel"
                    onClick={() => {
                      setShowAddFundsModal(false);
                      setAddFundsAmount("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      if (!addFundsAmount || Number(addFundsAmount) <= 0) {
                        alert("Please enter a valid amount");
                        return;
                      }
                      try {
                        await addFunds(
                          { userId, username: "user" },
                          Number(addFundsAmount)
                        );
                        const newBalance = await getWalletBalance();
                        setWalletBalance(newBalance);
                        setShowAddFundsModal(false);
                        setAddFundsAmount("");
                        setJoinMessage("Funds added successfully!");
                        setTimeout(() => setJoinMessage(""), 3000);
                      } catch (err) {
                        setJoinError(err.message || "Failed to add funds");
                        setTimeout(() => setJoinError(""), 3000);
                      }
                    }}
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
    </div>
  );
}
