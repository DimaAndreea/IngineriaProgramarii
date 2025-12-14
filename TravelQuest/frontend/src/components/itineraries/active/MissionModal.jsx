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

  const { status, submittedAt, reviewedAt, image, id } = submission;
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

  const isFinal = status === "approved" || status === "rejected";

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

        {reviewedAt && (
          <div className="mission-modal-section">
            <strong>{status === "approved" ? "Validated at:" : "Reviewed at:"}</strong>{" "}
            {formatDate(reviewedAt)}
          </div>
        )}

        <div className="mission-modal-section">
          <strong>Uploaded photo:</strong>
        </div>

        <div className="mission-modal-image-wrapper">
          <img src={image} alt="submission" />
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
            {status === "approved"
              ? "✓ This submission has been validated."
              : "✖ This submission has already been reviewed."}
          </p>
        )}
      </div>
    </div>
  );
}
