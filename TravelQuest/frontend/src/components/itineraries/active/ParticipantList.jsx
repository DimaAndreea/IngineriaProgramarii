import React from "react";
import "./ParticipantList.css";

export default function ParticipantsList({ participants = [] }) {
  return (
    <div className="participants-card">
      <h2 className="participants-title">Participants</h2>

      <div className="participants-list">
        {participants.map((p) => {
          const t = p.tourist || p.user || p; // fallback, în caz că schimbi backend-ul
          const username = t.username || t.name || t.email || `User #${t.id ?? p.id}`;
          const avatar = t.avatar;
          const level = t.level;

          return (
            <div className="participant-item" key={p.id}>
              <img
                src={avatar}
                alt={username}
                className="participant-avatar"
              />

              <div className="participant-info">
                <span className="participant-name">{username}</span>
                <span className="participant-role">Tourist</span>
                <span className="participant-level">Level {level}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

