import React from "react";
import { Link } from "react-router-dom";
import "./FeedbackList.css";

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

export default function FeedbackList({ participants = [], feedback = [] }) {
    // Map feedback by fromUserId (turist care a dat feedback)
    const feedbackMap = new Map(feedback.map(f => [f.fromUserId, f]));

    const combined = participants.map(p => {
        // Extract user data - participant poate fi ItineraryParticipant (cu .tourist) sau User direct
        const user = p.tourist || p;
        const foundFeedback = feedbackMap.get(user.id);
        return {
            id: user.id,
            name: user.username,
            avatar: user.avatar,
            feedback: foundFeedback || null
        };
    });

    const renderStars = (rating) => {
        return (
            <div className="feedback-stars">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={i < rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <polygon points="12 2 15.09 10.26 24 10.27 17.77 16.14 20.16 24.29 12 18.73 3.84 24.29 6.23 16.14 0 10.27 8.91 10.26 12 2" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="feedback-wrapper">
            <h2 className="feedback-title">Feedback</h2>

            {combined.map(p => (
                <div
                    key={p.id}
                    className={`feedback-card ${!p.feedback ? "pending" : ""}`}
                >
                    <div className="feedback-header">
                        {/* User Avatar */}
                        {p.avatar ? (
                            <img src={p.avatar} className="feedback-avatar" alt={p.name} />
                        ) : (
                            <div className="feedback-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                                    <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}

                        <div className="feedback-user-info">
                            <Link 
                                to={`/tourists/${p.id}`}
                                className="feedback-name-link"
                                state={{
                                    tourist: {
                                        id: p.id,
                                        username: p.name,
                                        avatar: p.avatar,
                                    }
                                }}
                            >
                                {p.name}
                            </Link>
                            {p.feedback ? (
                                <>
                                    {renderStars(p.feedback.rating)}
                                    <span className="feedback-date">{formatDate(p.feedback.createdAt)}</span>
                                </>
                            ) : (
                                <span className="feedback-pending">No feedback yet</span>
                            )}
                        </div>
                    </div>

                    <p className={`feedback-text ${!p.feedback ? "pending-text" : ""}`}>
                        {p.feedback
                            ? p.feedback.comment
                            : "This participant has not submitted feedback yet…"}
                    </p>
                </div>
            ))}
        </div>
    );
}
