import React from "react";
import "./MissionModal.css";

export default function MissionModal({
  mission,
  participant,
  submission,
  onApprove,
  onReject,
  onClose,
}) {
  if (!submission || !participant || !mission) return null;

  // ✅ backend fields
  const { status, submittedAt, validatedAt, submissionBase64, id } = submission;

  // în unele locuri participant poate fi { tourist: {...} }
  const t = participant.tourist ?? participant;

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ status is enum: PENDING / APPROVED / REJECTED
  const isFinal = status === "APPROVED" || status === "REJECTED";

  return (
    <div className="mission-modal-overlay">
      <div className="mission-modal-box">
        <button className="mission-modal-close" onClick={onClose}>
          ×
        </button>

        <h2 className="mission-modal-title">Mission submission</h2>

        <div className="mission-modal-section">
          <strong>Tourist:</strong> {t.username || t.name || t.email}
        </div>

        <div className="mission-modal-section">
          <strong>Mission:</strong> {mission.name ?? mission.text}
        </div>

        <div className="mission-modal-section">
          <strong>Submitted at:</strong> {formatDate(submittedAt)}
        </div>

        {validatedAt && (
          <div className="mission-modal-section">
            <strong>Validated at:</strong> {formatDate(validatedAt)}
          </div>
        )}

        <div className="mission-modal-section">
          <strong>Uploaded photo:</strong>
        </div>

        <div className="mission-modal-image-wrapper">
          {submissionBase64 ? (
            <img src={submissionBase64} alt="submission" />
          ) : (
            <p className="mission-modal-status-info">No image available.</p>
          )}
        </div>

        {!isFinal ? (
          <div className="mission-modal-buttons">
            <button className="approve-btn" onClick={() => onApprove(id)}>
              Approve
            </button>
            <button className="reject-btn" onClick={() => onReject(id)}>
              Reject
            </button>
          </div>
        ) : (
          <p className="mission-modal-status-info">
            {status === "APPROVED"
              ? "✓ This submission has been approved."
              : "✖ This submission has been rejected."}
          </p>
        )}
      </div>
    </div>
  );
}
