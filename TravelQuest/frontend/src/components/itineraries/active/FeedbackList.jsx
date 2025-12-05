import React from "react";
import "./FeedbackList.css";

export default function FeedbackList({ participants = [], feedback = [] }) {
    const feedbackMap = new Map(feedback.map(f => [f.id, f]));

    const combined = participants.map(p => ({
        ...p,
        feedback: feedbackMap.get(p.id) || null
    }));

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
                            src={p.avatar}
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
                            ? p.feedback.text
                            : "This participant has not submitted feedback yet…"}
                    </p>
                </div>
            ))}
        </div>
    );
}
