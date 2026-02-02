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
                {openMission === m.id ? (
                  <>
                    Hide Submissions
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                ) : (
                  <>
                    View Submissions
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
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
                  let statusIcon = (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  );

                  if (st === "APPROVED") {
                    statusLabel = "Approved";
                    statusClass = "approved";
                    statusIcon = (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    );
                  } else if (st === "REJECTED") {
                    statusLabel = "Rejected";
                    statusClass = "rejected";
                    statusIcon = (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    );
                  }

                  return (
                    <div key={sub.id} className="submission-row">
                      {/* avatar poate fi null; afișăm icon de user */}
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          className="submission-avatar"
                          alt={t.username || t.name || "tourist"}
                        />
                      ) : (
                        <div className="submission-avatar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                            <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}

                      <span className="submission-name">
                        {t.username || t.name || t.email}
                      </span>

                      <span className={"submission-status " + statusClass}>
                        {statusIcon}
                        {statusLabel}
                      </span>

                      <button
                        className="submission-view-btn"
                        onClick={() => onViewSubmission(participant, m, sub)}
                      >
                        View
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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
