import React from "react";
import "./MissionListTourist.css";

export default function MissionListTourist({
  missions = [],
  submissionsByMission = {},
  onMakeSubmission,
}) {
  const getStatusIcon = (status) => {
    const normalizedStatus = String(status).toUpperCase();
    
    if (normalizedStatus === "APPROVED") {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (normalizedStatus === "REJECTED") {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (normalizedStatus === "PENDING") {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    return null;
  };

  const getStatusLabel = (status) => {
    if (status === null || status === undefined || status === "") return "";
    const normalizedStatus = String(status).toUpperCase();
    if (normalizedStatus === "APPROVED") return "Approved";
    if (normalizedStatus === "REJECTED") return "Rejected";
    return "Pending";
  };

  const getStatusClass = (status) => {
    if (status === null || status === undefined || status === "") return "";
    const normalizedStatus = String(status).toUpperCase();
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
            {alreadySubmitted && (
              <span className={`tourist-submission-stamp ${getStatusClass(status)}`}>
                {getStatusIcon(status)}
                {getStatusLabel(status)}
              </span>
            )}

            <div className="tourist-mission-header">
              <div className="tourist-mission-title-section">
                <h3 className="tourist-mission-text">{missionLabel}</h3>
              </div>

              <button
                className="make-submission-btn"
                onClick={() => onMakeSubmission(mission)}
                disabled={alreadySubmitted}
                title={alreadySubmitted ? "You already submitted a photo." : ""}
              >
                {alreadySubmitted ? "Already submitted" : "Make submission"}
              </button>
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
          </div>
        );
      })}
    </div>
  );
}
