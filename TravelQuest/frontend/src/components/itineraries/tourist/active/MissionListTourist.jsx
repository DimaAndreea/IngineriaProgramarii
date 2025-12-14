import React from "react";
import "./MissionListTourist.css";

export default function MissionListTourist({
  missions = [],
  submissionsByMission = {},
  onMakeSubmission,
}) {
  const getStatusLabel = (status) => {
    const normalizedStatus = String(status).toUpperCase();
    if (!normalizedStatus) return "No submission yet";
    if (normalizedStatus === "APPROVED") return "Approved";
    if (normalizedStatus === "REJECTED") return "Rejected";
    return "Pending review";
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status).toUpperCase();
    if (!normalizedStatus) return "no-submission";
    if (normalizedStatus === "APPROVED") return "approved";
    if (normalizedStatus === "REJECTED") return "rejected";
    return "pending";
  };

  return (
    <div className="tourist-mission-list">
      {missions.map((mission) => {
        const missionId = mission.id ?? mission.objectiveId ?? mission.objective_id;

        const submissionsForMission = submissionsByMission[missionId] || [];
        const latestSubmission =
          submissionsForMission[submissionsForMission.length - 1] || null;

        const status = latestSubmission?.status;
        const alreadySubmitted = submissionsForMission.length > 0;

        const missionLabel = mission.text ?? mission.name ?? "Mission";

        return (
          <div key={missionId} className="tourist-mission-card">
            <div className="tourist-mission-header">
              <h3 className="tourist-mission-text">{missionLabel}</h3>

              <span className={`tourist-submission-badge ${getStatusClass(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            {latestSubmission?.image && (
              <div className="tourist-submission-preview">
                <img
                  src={latestSubmission.image}
                  alt="Your submission"
                  className="tourist-submission-img"
                />
              </div>
            )}

            <div className="tourist-mission-actions">
              <button
                className="make-submission-btn"
                onClick={() => onMakeSubmission(mission)}
                disabled={alreadySubmitted}
                title={alreadySubmitted ? "You already submitted a photo." : ""}
              >
                {alreadySubmitted ? "Already submitted" : "Make submission"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
