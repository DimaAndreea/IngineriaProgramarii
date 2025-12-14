import React from "react";
import "./ParticipantList.css";

export default function ParticipantsList({ participants = [] }) {
    return (
        <div className="participants-card">
            <h2 className="participants-title">Participants</h2>

            <div className="participants-list">
                {participants.map(p => (
                    <div className="participant-item" key={p.username}>
                        <img
                            src={p.avatar}
                            alt={p.username}
                            className="participant-avatar"
                        />

                        <div className="participant-info">
                            <span className="participant-name">{p.username}</span>
                            <span className="participant-role">Tourist</span>
                            <span className="participant-level">
                                Level {p.level}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
