import React, { useState } from "react";
import "./MissionList.css";

export default function MissionList({
  missions = [],
  participants = [],
  submissions = [],
  onViewSubmission,
}) {
  const [openMission, setOpenMission] = useState(null);

  const toggleMission = (id) => {
    setOpenMission(openMission === id ? null : id);
  };

  // participants = ItineraryParticipant; turistul real e p.tourist
  const getParticipantById = (touristId) =>
    participants.find((p) => (p.tourist?.id ?? p.id) === touristId);

  return (
    <div className="missions-container">
      <h2 className="section-title">Missions</h2>

      {missions.map((m) => {
        const missionSubmissions = submissions.filter(
          (s) => (s.objectiveId ?? s.missionId ?? s.objective?.id) === m.id
        );

        return (
          <div key={m.id} className="mission-item">
            <div className="mission-header">
              <p className="mission-text">{m.name ?? m.text}</p>

              <button className="toggle-submissions-btn" onClick={() => toggleMission(m.id)}>
                {openMission === m.id ? "Hide Submissions ▲" : "View Submissions ▼"}
              </button>
            </div>

            {openMission === m.id && (
              <div className="submissions-panel">
                {missionSubmissions.length === 0 && (
                  <p className="empty-submissions">No submissions yet for this mission.</p>
                )}

                {missionSubmissions.map((sub) => {
                  const pid =
                    sub.participantId ?? sub.touristId ?? sub.userId ?? sub.tourist?.id;

                  const participant = getParticipantById(pid);
                  if (!participant) return null;

                  const t = participant.tourist ?? participant;

                  let statusLabel = "Pending";
                  let statusClass = "pending";
                  if (sub.status === "approved") {
                    statusLabel = "✓ Validated";
                    statusClass = "approved";
                  } else if (sub.status === "rejected") {
                    statusLabel = "Rejected";
                    statusClass = "rejected";
                  }

                  return (
                    <div key={sub.id} className="submission-row">
                      <img
                        src={t.avatar}
                        className="submission-avatar"
                        alt={t.username || t.name || "tourist"}
                      />

                      <span className="submission-name">{t.username || t.name || t.email}</span>

                      <span className={"submission-status " + statusClass}>{statusLabel}</span>

                      <button
                        className="submission-view-btn"
                        onClick={() => onViewSubmission(participant, m, sub)}
                      >
                        View →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
