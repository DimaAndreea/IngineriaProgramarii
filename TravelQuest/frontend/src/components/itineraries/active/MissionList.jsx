import React, { useState } from "react";
import "./MissionList.css";

export default function MissionList({
    missions,
    participants,
    submissions,
    onViewSubmission
}) {
    const [openMission, setOpenMission] = useState(null);

    const toggleMission = (id) => {
        setOpenMission(openMission === id ? null : id);
    };

    const getParticipantById = (id) =>
        participants.find((p) => p.id === id);

    return (
        <div className="missions-container">
            <h2 className="section-title">Missions</h2>

            {missions.map((m) => {
                const missionSubmissions = submissions.filter(
                    (s) => s.missionId === m.id
                );

                return (
                    <div key={m.id} className="mission-item">
                        {/* HEADER */}
                        <div className="mission-header">
                            <p className="mission-text">{m.text}</p>

                            <button
                                className="toggle-submissions-btn"
                                onClick={() => toggleMission(m.id)}
                            >
                                {openMission === m.id
                                    ? "Hide Submissions ▲"
                                    : "View Submissions ▼"}
                            </button>
                        </div>

                        {/* SUBMISSIONS LIST */}
                        {openMission === m.id && (
                            <div className="submissions-panel">
                                {missionSubmissions.length === 0 && (
                                    <p className="empty-submissions">
                                        No submissions yet for this mission.
                                    </p>
                                )}

                                {missionSubmissions.map((sub) => {
                                    const participant = getParticipantById(
                                        sub.participantId
                                    );
                                    if (!participant) return null;

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
                                        <div
                                            key={sub.id}
                                            className="submission-row"
                                        >
                                            <img
                                                src={participant.avatar}
                                                className="submission-avatar"
                                                alt={participant.name}
                                            />
                                            <span className="submission-name">
                                                {participant.name}
                                            </span>

                                            <span
                                                className={
                                                    "submission-status " +
                                                    statusClass
                                                }
                                            >
                                                {statusLabel}
                                            </span>

                                            <button
                                                className="submission-view-btn"
                                                onClick={() =>
                                                    onViewSubmission(
                                                        participant,
                                                        m,
                                                        sub
                                                    )
                                                }
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
