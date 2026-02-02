import React, { useEffect, useState } from "react";
import "./SubmissionModal.css";

export default function SubmissionModal({ mission, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mission) console.log("Opened submission modal for mission:", mission);
  }, [mission]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!mission) return null;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError("");
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const objectiveId = mission.id ?? mission.objectiveId ?? mission.objective_id;
      await onSubmit(objectiveId, file);
    } catch {
      // de obicei page-ul afișează error-ul global
      setError("Failed to submit photo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = mission.text ?? mission.name ?? "";

  return (
    <div className="submission-modal-backdrop" onClick={onClose}>
      <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Submit photo</h2>
        <p className="modal-mission-text">{label}</p>

        <form onSubmit={handleSubmit} className="submission-form">
          <label className="file-input-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 8L12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16V20H20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Choose image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          {previewUrl && (
            <div className="preview-box">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="soft-btn ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button type="submit" className="soft-btn primary" disabled={submitting}>
              {submitting ? "Sending..." : "Send submission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
