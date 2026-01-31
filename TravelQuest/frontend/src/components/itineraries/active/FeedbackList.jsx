import React from "react";
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
            feedback: foundFeedback || null
        };
    });

    return (
        <div className="feedback-wrapper">

            <h2 className="feedback-title">Feedback</h2>

            {combined.map(p => (
                <div
                    key={p.id}
                    className={`feedback-card ${!p.feedback ? "pending" : ""}`}
                >
                    <div className="feedback-header">
                        <div className="feedback-user">
                            <span className="feedback-name">{p.name}</span>

                            {p.feedback ? (
                                <>
                                    <span className="feedback-stars">
                                        {"⭐".repeat(p.feedback.rating)}
                                    </span>
                                    <span className="feedback-date">
                                        {formatDate(p.feedback.createdAt)}
                                    </span>
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
