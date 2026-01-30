import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getItineraryById,
  updateItinerary,
  deleteItinerary,
} from "../services/itineraryService";
import { getWalletBalance, purchaseItinerary, addFunds } from "../services/walletService";
import { useAuth } from "../context/AuthContext";
import ItineraryForm from "../components/itineraries/ItineraryForm";
import PaymentModal from "../components/common/PaymentModal";
import "./ItineraryDetailsPage.css";

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
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");

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
  const canJoinThis = isTourist && rawStatus === "APPROVED";

  // ======================
  // LOAD ITINERARY
  // ======================
  useEffect(() => {
    async function load() {
      try {
        const data = await getItineraryById(id);
        setItinerary(data);
        
        // Load wallet balance for tourists
        if (isTourist) {
          const balance = await getWalletBalance();
          setWalletBalance(balance);
        }
      } catch (err) {
        console.error("Failed to load itinerary:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isTourist, userId]);

  // ======================
  // DELETE
  // ======================
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const realId =
        itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;
      await deleteItinerary(realId);
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
    const realId =
      itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;

    try {
      const updated = await updateItinerary(realId, values);
      setItinerary(updated);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  }

  // ======================
  // JOIN TOUR (TOURIST) - WITH PAYMENT
  // ======================
  function handleJoinClick() {
    setJoinMessage("");
    setJoinError("");
    setShowPaymentModal(true);
  }

  async function handlePurchaseConfirm() {
    const realId = itinerary.id || itinerary.itineraryId || itinerary.itinerary_id;
    const price = Number(itinerary.price || 0);

    try {
      // Process payment
      const result = await purchaseItinerary(realId, price);
      
      // Update local wallet balance
      setWalletBalance(result.balance);
      
      setShowPaymentModal(false);
      setJoinMessage(result.message || "Payment successful! You have joined this itinerary.");
      setJoinError("");
    } catch (err) {
      setShowPaymentModal(false);
      setJoinError(err?.message || "Failed to complete purchase");
      setJoinMessage("");
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!itinerary) return <div className="error">Itinerary not found.</div>;

  const creatorId = itinerary?.creator?.id;
  const creatorName = itinerary?.creator?.username || "Guide";

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

        {!isTourist && (
          <span className={`status-tag ${statusClass}`}>{displayStatus}</span>
        )}

        {/* ✅ link către profilul ghidului */}
        <span className="author-tag">
          By:{" "}
          {creatorId ? (
            <Link className="author-link" to={`/guides/${creatorId}`}>
              {creatorName}
            </Link>
          ) : (
            creatorName
          )}
        </span>

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

        {/* JOIN BUTTON – TOURIST */}
        {canJoinThis && (
          <div className="creator-action-row" style={{ marginTop: "20px" }}>
            <button
              className="soft-btn primary"
              onClick={handleJoinClick}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Join tour
            </button>

            {joinMessage && <p className="join-success">{joinMessage}</p>}
            {joinError && <p className="join-error">{joinError}</p>}
          </div>
        )}

        {/* ACTIONS — EDIT & DELETE (creator) */}
        {(canEditThis || canDeleteThis) && (
          <div className="creator-action-row">
            {canEditThis && (
              <button className="soft-btn edit" onClick={() => setShowEditModal(true)}>
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
      
      {/* PAYMENT MODAL */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePurchaseConfirm}
        itinerary={itinerary}
        currentBalance={walletBalance}
        onAddFundsClick={() => {
          setShowPaymentModal(false);
          setShowAddFundsModal(true);
        }}
      />

      {/* ADD FUNDS MODAL - Quick add from payment modal */}
      {showAddFundsModal && (
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
  );
}
