import React from "react";
import { Link } from "react-router-dom";
import "./ParticipantList.css";

export default function ParticipantsList({ participants = [], contextItinerary = null }) {
  return (
    <div className="participants-card">
      <h2 className="participants-title">Participants</h2>

      <div className="participants-list">
        {participants.map((p) => {
          const t = p.tourist || p.user || p;
          const id = t?.id ?? p?.id;

          const username = t?.username || t?.name || t?.email || `User #${id ?? "?"}`;
          const avatar = t?.avatar;
          const level = t?.level;

          // încearcă să găsești numele badge-ului “vizibil” din datele participantului (dacă există)
          const visibleBadgeName =
            t?.selectedBadge?.name ||
            t?.visibleBadge?.name ||
            t?.visibleBadgeName ||
            null;

          const profilePath = id != null ? `/tourists/${id}` : null;

          return (
            <div className="participant-item" key={p.id ?? id ?? username}>
              <img src={avatar} alt={username} className="participant-avatar" />

              <div className="participant-info">
                {profilePath ? (
                  <Link
                    className="participant-name"
                    to={profilePath}
                    state={{
                      tourist: {
                        id,
                        username,
                        avatar,
                        level,
                        visibleBadgeName,
                      },
                      // 👇 “context itineraries” (ce știm deja din UI)
                      contextItineraries: contextItinerary ? [contextItinerary] : [],
                    }}
                    title="Open tourist profile"
                    style={{ textDecoration: "none" }}
                  >
                    {username}
                  </Link>
                ) : (
                  <span className="participant-name">{username}</span>
                )}

                <span className="participant-role">Tourist</span>
                <span className="participant-level">Level {level ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
