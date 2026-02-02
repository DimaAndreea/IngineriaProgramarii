import React, { useEffect, useState } from "react";
import { getGuideReviews } from "../../services/itineraryService";
import "./GuideReviewsSection.css";

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export default function GuideReviewsSection({ guideId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!guideId) {
            console.log("⚠️ GuideReviewsSection: No guideId provided");
            return;
        }

        async function loadReviews() {
            try {
                setLoading(true);
                setError("");
                console.log("📥 Loading reviews for guide:", guideId);
                const data = await getGuideReviews(guideId);
                console.log("✅ Reviews loaded:", data);
                setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("❌ Failed to load reviews:", err);
                setError("Failed to load reviews");
                setReviews([]);
            } finally {
                setLoading(false);
            }
        }

        loadReviews();
    }, [guideId]);

    if (loading) {
        return (
            <section className="guide-reviews-section">
                <h2 className="reviews-title">Reviews & Feedback</h2>
                <p className="reviews-loading">Loading reviews...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="guide-reviews-section">
                <h2 className="reviews-title">Reviews & Feedback</h2>
                <p className="reviews-error">{error}</p>
            </section>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <section className="guide-reviews-section">
                <h2 className="reviews-title">Reviews & Feedback</h2>
                <p className="reviews-empty">No reviews yet. Start guiding to receive feedback!</p>
            </section>
        );
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <section id="guide-reviews" className="guide-reviews-section">
            <h2 className="reviews-title">Reviews & Feedback</h2>

            <div className="reviews-stats">
                <div className="reviews-stat-item">
                    <span className="stat-label">Average Rating</span>
                    <span className="stat-value">
                        {averageRating}
                        <span className="review-stars" aria-hidden="true">★</span>
                        <span className="review-count">({reviews.length} reviews)</span>
                    </span>
                </div>
            </div>

            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="review-info">
                                <div className="review-left">
                                    <span className="review-avatar" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.6" />
                                            <path d="M4 20c1.6-4 5-6 8-6s6.4 2 8 6" fill="currentColor" opacity="0.35" />
                                        </svg>
                                    </span>
                                    <span className="review-from">
                                        {review.fromUsername}
                                    </span>
                                    <span className="review-rating">
                                        <span className="review-stars" aria-hidden="true">{"★".repeat(review.rating)}</span>
                                    </span>
                                </div>
                                <span className="review-date">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="review-itinerary">
                            <span className="review-itinerary-label">
                                from itinerary: {review.itineraryTitle}
                            </span>
                        </div>

                        <p className="review-comment">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
