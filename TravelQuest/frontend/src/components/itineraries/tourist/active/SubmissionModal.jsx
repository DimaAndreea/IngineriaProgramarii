import React, { useState } from "react";
import "./SubmissionModal.css";

export default function SubmissionModal({ mission, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!mission) return null;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError("");

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image first.");
      return;
    }
    if (!onSubmit) return;

    try {
      setSubmitting(true);
      setError("");
      await onSubmit(mission.id, file);
    } catch (err) {
      console.error(err);
      setError("Failed to submit photo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submission-modal-backdrop" onClick={onClose}>
      <div
        className="submission-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Submit photo</h2>
        <p className="modal-mission-text">{mission.text}</p>

        <form onSubmit={handleSubmit} className="submission-form">
          <label className="file-input-label">
            <span>Choose image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
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

            <button
              type="submit"
              className="soft-btn primary"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send submission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
