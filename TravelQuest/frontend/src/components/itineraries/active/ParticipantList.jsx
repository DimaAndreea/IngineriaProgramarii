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
              <div className="participant-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>

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

                <span className="participant-level">Level {level ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
