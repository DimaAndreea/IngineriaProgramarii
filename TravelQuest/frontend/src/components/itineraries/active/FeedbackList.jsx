import React from "react";
import "./FeedbackList.css";

export default function FeedbackList({ participants = [], feedback = [] }) {
    // Debug: log ce primim
    console.log("🎯 FeedbackList received:");
    console.log("   Participants:", participants);
    console.log("   Feedback:", feedback);

    // Map feedback by fromUserId (turist care a dat feedback)
    const feedbackMap = new Map(feedback.map(f => [f.fromUserId, f]));
    console.log("   FeedbackMap keys:", Array.from(feedbackMap.keys()));

    const combined = participants.map(p => {
        // Extract user data - participant poate fi ItineraryParticipant (cu .tourist) sau User direct
        const user = p.tourist || p;
        const foundFeedback = feedbackMap.get(user.id);
        console.log(`   Participant ${user.id} (${user.username}): feedback =`, foundFeedback);
        return {
            id: user.id,
            name: user.username,
            avatar: user.avatar,
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
                        <img
                            src={p.avatar || "https://via.placeholder.com/40?text=Avatar"}
                            alt={p.name}
                            className="feedback-avatar"
                        />

                        <div className="feedback-user">
                            <span className="feedback-name">{p.name}</span>

                            {p.feedback ? (
                                <span className="feedback-stars">
                                    {"⭐".repeat(p.feedback.rating)}
                                </span>
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
