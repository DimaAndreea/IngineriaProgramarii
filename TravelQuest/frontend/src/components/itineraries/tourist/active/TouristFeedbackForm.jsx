import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./TouristFeedbackForm.css";

export default function TouristFeedbackForm({
  guideId,
  guideName,
  onSubmit,
  isSubmitting = false,
  hasFeedback = false,
  existingFeedback = null,
}) {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [text, setText] = useState(existingFeedback?.comment || "");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    if (!text.trim()) {
      alert("Please write a feedback message.");
      return;
    }

    onSubmit({ rating, comment: text.trim() });
  };

  const guideLabel = guideName || "Your Guide";

  const GuideLink = ({ className }) =>
    guideId ? (
      <Link className={className} to={`/guides/${guideId}`}>
        {guideLabel}
      </Link>
    ) : (
      <span className={className}>{guideLabel}</span>
    );

  const GuideAvatar = ({ size = 32 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#E5E7EB" />
        <circle cx="32" cy="26" r="10" fill="#9CA3AF" />
        <path d="M16 52c2-8 28-8 32 0" fill="#9CA3AF" />
      </svg>
    </span>
  );

  if (hasFeedback && existingFeedback) {
    return (
      <div className="tourist-feedback-wrapper">
        <h2 className="feedback-title">Your Feedback</h2>
        
        <div className="feedback-submitted-card">
          <div className="feedback-submitted-header">
            <span className="feedback-guide-name">
              <GuideAvatar size={28} />
              Guide: <GuideLink className="guide-link" />
            </span>
            <span className="feedback-stars">
              {"★".repeat(existingFeedback.rating)}
              {"☆".repeat(5 - existingFeedback.rating)}
            </span>
          </div>
          
          <p className="feedback-text">{existingFeedback.comment}</p>
          
          <p className="feedback-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Thank you for your feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tourist-feedback-wrapper">
      <h2 className="feedback-title">Give Feedback to Your Guide</h2>
      
      <div className="feedback-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <GuideAvatar size={28} />
              Guide: <GuideLink className="guide-link" />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoveredStar || rating) ? "filled" : ""}`}
                  onClick={() => !isSubmitting && setRating(star)}
                  onMouseEnter={() => !isSubmitting && setHoveredStar(star)}
                  onMouseLeave={() => !isSubmitting && setHoveredStar(0)}
                >
                  {star <= (hoveredStar || rating) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="rating-text">
              {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select a rating"}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Your Feedback</label>
            <textarea
              className="feedback-textarea"
              placeholder="Share your experience with this guide..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-feedback-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
