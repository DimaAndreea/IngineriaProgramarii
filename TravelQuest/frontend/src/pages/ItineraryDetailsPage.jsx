import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  getLocalEnrollments,
  addLocalEnrollment,
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
  const locationsScrollRef = useRef(null);

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinError, setJoinError] = useState("");
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

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
        const local = getLocalEnrollments();
        const hasParticipants = Array.isArray(data?.participants);
        const joinedFromApi = hasParticipants
          ? data.participants.some(
              (p) => Number(p?.tourist?.id) === Number(userId)
            )
          : false;
        setHasJoined(hasParticipants ? joinedFromApi : local.includes(Number(id)));
        
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
      addLocalEnrollment(realId);
      setHasJoined(true);
      
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

  const formatDate = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  };

  const locations = itinerary.locations || [];
  const primaryLocation = locations[0] || {};
  const totalObjectives = locations.reduce(
    (sum, loc) => sum + (loc.objectives?.length || 0),
    0
  );
  const countryText = locations.length === 1 ? primaryLocation.country : locations.length > 1 ? "Multiple" : "—";
  const cityText = locations.length === 1 ? primaryLocation.city : locations.length > 1 ? "Multiple" : "—";
  const objectivesText = totalObjectives ? `${totalObjectives} objectives` : "—";

  const scrollLocations = (direction) => {
    if (!locationsScrollRef.current) return;
    const amount = 360;
    locationsScrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const creatorId = itinerary?.creator?.id;
  const creatorName = itinerary?.creator?.username || "Guide";

  const backgroundImage = itinerary.imageBase64
    ? itinerary.imageBase64.startsWith("data:")
      ? itinerary.imageBase64
      : `data:image/jpeg;base64,${itinerary.imageBase64}`
    : "";

  return (
    <div
      className="details-page"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
    <div className="details-page-overlay" />
    <div className="details-wrapper">
      {/* TITLE */}
      <h1 className="details-title">{itinerary.title}</h1>

      {/* IMAGE + INFO CARD LAYOUT */}
      <div className="details-hero-layout">
        {/* IMAGE - LEFT SIDE (3 cols) */}
        <div className="details-gallery">
          <img className="gallery-main" src={itinerary.imageBase64} alt="Itinerary" />
        </div>

        {/* INFO CARD - RIGHT SIDE (1 col) */}
        <div className="details-info-card">
          {/* DATE RANGE */}
          <div className="info-card-date">
            <CalendarIcon />
            {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
          </div>

          {/* AUTHOR */}
          <div className="info-card-author">
            <PersonIcon />
            By:{" "}
            {creatorId ? (
              <Link className="author-link" to={`/guides/${creatorId}`}>
                {creatorName}
              </Link>
            ) : (
              creatorName
            )}
          </div>

          {/* PRICE */}
          <div className="info-card-price">
            <MoneyIcon />
            {itinerary.price} RON
          </div>

          {/* JOIN BUTTON – TOURIST */}
          {canJoinThis && (
            <div className="info-card-action">
              <button
                className={`soft-btn primary ${hasJoined ? "disabled" : ""}`}
                onClick={handleJoinClick}
                disabled={hasJoined}
              >
                {hasJoined ? "Already joined" : "Join tour"}
              </button>

              {joinMessage && <p className="join-success">{joinMessage}</p>}
              {joinError && <p className="join-error">{joinError}</p>}
            </div>
          )}

          {/* STATUS TAG - NON TOURISTS */}
          {!isTourist && (
            <div className="info-card-status">
              <span className={`status-tag ${statusClass}`}>{displayStatus}</span>
            </div>
          )}

          {/* ACTIONS — EDIT & DELETE (creator) */}
          {(canEditThis || canDeleteThis) && (
            <div className="info-card-actions">
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
      </div>

      {/* ABOUT SECTION */}
      <div className="details-section">
        <h2 className="section-title">About this activity</h2>
        <p className="details-description">{itinerary.description}</p>
        <div className="about-stats">
          <span className="stat-item">
            <TagIcon />
            {itinerary.category}
          </span>
          <span className="stat-item">
            <ChecklistIcon />
            {objectivesText}
          </span>
        </div>
      </div>

      {/* LOCATIONS GRID */}
      <h2 className="section-title">Locations</h2>
      <div className="locations-scroll-wrap">
        <button
          className="scroll-btn left"
          type="button"
          onClick={() => scrollLocations("left")}
          aria-label="Scroll locations left"
        >
          <ChevronLeftIcon />
        </button>
        <div className="locations-scroll" ref={locationsScrollRef}>
          {locations.map((loc, index) => (
            <div className="location-card grid-card" key={index}>
            <h3>Location #{index + 1}</h3>
            <p className="location-line">
              <FlagIcon />
              <strong>Country:</strong> {loc.country}
            </p>
            <p className="location-line">
              <PinIcon />
              <strong>City:</strong> {loc.city}
            </p>
            <p className="objectives-label">
              <ChecklistIcon />
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
        <button
          className="scroll-btn right"
          type="button"
          onClick={() => scrollLocations("right")}
          aria-label="Scroll locations right"
        >
          <ChevronRightIcon />
        </button>
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
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v12A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-12A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm12.5 7H4.5v9.5c0 .552.448 1 1 1h13c.552 0 1-.448 1-1V9ZM6 6H4.5c-.552 0-1 .448-1 1V8h17V7c0-.552-.448-1-1-1H18v1a1 1 0 1 1-2 0V6H8v1a1 1 0 1 1-2 0V6Z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.015-8 4.5A1.5 1.5 0 0 0 5.5 20h13A1.5 1.5 0 0 0 20 18.5C20 16.015 16.418 14 12 14Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83ZM6.5 8A1.5 1.5 0 1 1 8 6.5 1.5 1.5 0 0 1 6.5 8Z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 9.9 6.5 5 7.2l3.5 3.4-.8 4.9L12 13.7l4.3 1.8-.8-4.9L19 7.2l-4.9-.7L12 2Z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 0v12h14V6H5Zm7 2a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3a1 1 0 0 1 1 1v2h9.5a1 1 0 0 1 .8 1.6L15.5 10l1.8 2.4a1 1 0 0 1-.8 1.6H7v7a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm1 5v4h7.5l-1.2-1.6a1 1 0 0 1 0-1.2L14.5 8H7Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 6.12 12.18 6.38 12.46a.85.85 0 0 0 1.24 0C12.88 21.18 19 14.25 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 6.5 7.7 8.3 6.5 7.1a1 1 0 1 0-1.4 1.4l1.9 1.9a1 1 0 0 0 1.4 0l2.6-2.6a1 1 0 0 0-1.4-1.4Zm0 7L7.7 15.3l-1.2-1.2a1 1 0 1 0-1.4 1.4l1.9 1.9a1 1 0 0 0 1.4 0l2.6-2.6a1 1 0 0 0-1.4-1.4ZM13 8a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2Zm0 7a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2Z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.5 5.5a1 1 0 0 1 0 1.4L10.4 12l5.1 5.1a1 1 0 1 1-1.4 1.4l-5.8-5.8a1 1 0 0 1 0-1.4l5.8-5.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 18.5a1 1 0 0 1 0-1.4l5.1-5.1-5.1-5.1a1 1 0 1 1 1.4-1.4l5.8 5.8a1 1 0 0 1 0 1.4l-5.8 5.8a1 1 0 0 1-1.4 0Z" />
    </svg>
  );
}
