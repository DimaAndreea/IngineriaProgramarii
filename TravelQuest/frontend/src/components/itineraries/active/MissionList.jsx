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
  const getParticipantById = (touristId) => {
    const tid = Number(touristId);
    return participants.find((p) => Number(p.tourist?.id ?? p.id) === tid);
  };

  const normalizeStatus = (s) => (s ? String(s).toUpperCase() : "PENDING");

  return (
    <div className="missions-container">
      <h2 className="section-title">Missions</h2>

      {missions.map((m) => {
        const mid = Number(m.id);

        // ✅ filtrează submisiile pentru misiunea curentă
        const missionSubmissions = submissions.filter((s) => {
          const oid = Number(s.objectiveId ?? s.missionId ?? s.objective?.id);
          return oid === mid;
        });

        return (
          <div key={m.id} className="mission-item">
            <div className="mission-header">
              <p className="mission-text">{m.name ?? m.text}</p>

              <button
                className="toggle-submissions-btn"
                onClick={() => toggleMission(m.id)}
              >
                {openMission === m.id ? "Hide Submissions ▲" : "View Submissions ▼"}
              </button>
            </div>

            {openMission === m.id && (
              <div className="submissions-panel">
                {missionSubmissions.length === 0 && (
                  <p className="empty-submissions">No submissions yet for this mission.</p>
                )}

                {missionSubmissions.map((sub) => {
                  const pid = Number(
                    sub.participantId ??
                      sub.touristId ??
                      sub.userId ??
                      sub.tourist?.id
                  );

                  const participant = getParticipantById(pid);
                  if (!participant) return null;

                  const t = participant.tourist ?? participant;

                  const st = normalizeStatus(sub.status);

                  let statusLabel = "Pending";
                  let statusClass = "pending";

                  if (st === "APPROVED") {
                    statusLabel = "✓ Approved";
                    statusClass = "approved";
                  } else if (st === "REJECTED") {
                    statusLabel = "Rejected";
                    statusClass = "rejected";
                  }

                  return (
                    <div key={sub.id} className="submission-row">
                      {/* avatar poate fi null; păstrăm img doar dacă există */}
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          className="submission-avatar"
                          alt={t.username || t.name || "tourist"}
                        />
                      ) : (
                        <div className="submission-avatar placeholder" />
                      )}

                      <span className="submission-name">
                        {t.username || t.name || t.email}
                      </span>

                      <span className={"submission-status " + statusClass}>
                        {statusLabel}
                      </span>

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
