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
  const [text, setText] = useState(existingFeedback?.text || "");
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

    onSubmit({ rating, text: text.trim() });
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

  if (hasFeedback && existingFeedback) {
    return (
      <div className="tourist-feedback-wrapper">
        <h2 className="feedback-title">Your Feedback</h2>
        
        <div className="feedback-submitted-card">
          <div className="feedback-submitted-header">
            <span className="feedback-guide-name">
              Guide: <GuideLink className="guide-link" />
            </span>
            <span className="feedback-stars">
              {"⭐".repeat(existingFeedback.rating)}
            </span>
          </div>
          
          <p className="feedback-text">{existingFeedback.text}</p>
          
          <p className="feedback-notice">
            ✓ You have already submitted feedback for this itinerary.
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
                  ⭐
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
