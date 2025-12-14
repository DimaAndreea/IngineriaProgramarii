import React from "react";
import "./MissionListTourist.css";

export default function MissionListTourist({ missions = [], submissionsByMission = {}, onMakeSubmission }) {
    const getStatusLabel = (status) => {
        if (!status) return "No submission yet";
        if (status === "approved") return "Approved";
        if (status === "rejected") return "Rejected";
        return "Pending review";
    };

    const getStatusClass = (status) => {
        if (!status) return "no-submission";
        if (status === "approved") return "approved";
        if (status === "rejected") return "rejected";
        return "pending";
    };

    return (
        <div className="tourist-mission-list">
            {missions.map((mission) => {
                const submissionsForMission = submissionsByMission[mission.id] || [];
                const latestSubmission = submissionsForMission[submissionsForMission.length - 1] || null;
                const status = latestSubmission?.status;

                return (
                    <div key={mission.id} className="tourist-mission-card">
                        <div className="tourist-mission-header">
                            <h3 className="tourist-mission-text">{mission.text}</h3>
                            <span className={`tourist-submission-badge ${getStatusClass(status)}`}>
                {getStatusLabel(status)}
              </span>
                        </div>

                        {latestSubmission?.image && (
                            <div className="tourist-submission-preview">
                                <img src={latestSubmission.image} alt="Your submission" className="tourist-submission-img" />
                            </div>
                        )}

                        <div className="tourist-mission-actions">
                            <button className="make-submission-btn" onClick={() => onMakeSubmission(mission)}>
                                Make submission
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
