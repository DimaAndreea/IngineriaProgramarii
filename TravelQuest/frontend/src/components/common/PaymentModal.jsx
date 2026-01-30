import React, { useState, useEffect } from "react";
import "./PaymentModal.css";

export default function PaymentModal({
  open,
  onClose,
  onConfirm,
  itinerary,
  currentBalance = 0,
  onAddFundsClick,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const price = Number(itinerary?.price || 0);
  const title = itinerary?.title || "Itinerary";
  const hasEnoughFunds = currentBalance >= price;
  const shortfall = Math.max(0, price - currentBalance);

  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
    }
  }, [open]);

  if (!open) return null;

  const handleBuy = async () => {
    if (!hasEnoughFunds || isProcessing) return;

    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2 className="payment-modal-title">Complete Purchase</h2>
          <button className="payment-modal-close" onClick={onClose} disabled={isProcessing}>
            ✕
          </button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-itinerary-card">
            <div className="payment-itinerary-info">
              <span className="payment-label">Itinerary</span>
              <span className="payment-itinerary-title">{title}</span>
            </div>

            <div className="payment-price-row">
              <span className="payment-label">Price</span>
              <span className="payment-price">{price.toFixed(2)} RON</span>
            </div>
          </div>

          <div className="payment-divider" />

          <div className="payment-balance-section">
            <div className="payment-balance-row">
              <span className="payment-label">Current Balance</span>
              <span className="payment-balance">{currentBalance.toFixed(2)} RON</span>
            </div>

            <div className="payment-balance-row">
              <span className="payment-label">After Purchase</span>
              <span
                className={`payment-new-balance ${hasEnoughFunds ? "" : "insufficient"}`}
              >
                {hasEnoughFunds
                  ? `${(currentBalance - price).toFixed(2)} RON`
                  : "Insufficient funds"}
              </span>
            </div>
          </div>

          {!hasEnoughFunds && (
            <div className="payment-warning">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                  fill="currentColor"
                />
              </svg>
              <div>
                <strong>Insufficient Funds!</strong>
                <p>You need {shortfall.toFixed(2)} RON more to purchase this itinerary.</p>
              </div>
            </div>
          )}
        </div>

        <div className="payment-modal-footer">
          <button
            className="payment-btn payment-btn-cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>

          {!hasEnoughFunds && onAddFundsClick && (
            <button
              className="payment-btn payment-btn-add-funds"
              onClick={() => {
                onClose();
                onAddFundsClick();
              }}
              disabled={isProcessing}
            >
              Add Funds
            </button>
          )}

          <button
            className="payment-btn payment-btn-buy"
            onClick={handleBuy}
            disabled={!hasEnoughFunds || isProcessing}
          >
            {isProcessing ? "Processing..." : "Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}
