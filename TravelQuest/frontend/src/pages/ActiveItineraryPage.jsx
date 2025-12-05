import React, { useState } from "react";
import "./ActiveItineraryPage.css";

import ProgressBar from "../components/itineraries/active/ProgressBar";
import ParticipantList from "../components/itineraries/active/ParticipantList";
import MissionList from "../components/itineraries/active/MissionList";
import FeedbackList from "../components/itineraries/active/FeedbackList";
import MissionModal from "../components/itineraries/active/MissionModal";

export default function ActiveItineraryPage() {
    const stages = ["Created", "Brașov", "Sibiu", "Cluj", "Feedback"];

    const participants = [
        { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?img=1", level: 5 },
        { id: 2, name: "David", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: 3, name: "Hugh", avatar: "https://i.pravatar.cc/150?img=3" }
    ];

    const missions = [
        [
            { id: 1, text: "Take a photo with the Black Church." },
            { id: 2, text: "Try a local dish and upload a photo." }
        ],
        [{ id: 3, text: "Capture the Council Tower in Sibiu." }],
        [{ id: 4, text: "Upload a photo from Cluj Central Park." }]
    ];

    const [submissions, setSubmissions] = useState([
        {
            id: 1,
            missionId: 1,
            participantId: 1,
            status: "approved",
            submittedAt: "2025-11-19T10:30:00Z",
            reviewedAt: "2025-11-19T11:05:00Z",
            image: "https://images.pexels.com/photos/2901207/pexels-photo-2901207.jpeg"
        },
        {
            id: 2,
            missionId: 1,
            participantId: 2,
            status: "pending",
            submittedAt: "2025-11-19T10:45:00Z",
            image: "https://images.pexels.com/photos/589810/pexels-photo-589810.jpeg"
        },
        {
            id: 3,
            missionId: 1,
            participantId: 3,
            status: "rejected",
            submittedAt: "2025-11-19T11:10:00Z",
            reviewedAt: "2025-11-19T11:35:00Z",
            image: "https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg"
        }
    ]);

    const feedback = [
        { id: 1, name: "Alice", rating: 5, text: "Amazing experience!" },
        { id: 2, name: "David", rating: 4, text: "Enjoyed every moment." }
    ];

    const [currentStage, setCurrentStage] = useState(0);

    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const currentLocationMissions =
        currentStage > 0 && currentStage < stages.length - 1
            ? missions[currentStage - 1]
            : [];

    const goNext = () =>
        setCurrentStage((s) => Math.min(s + 1, stages.length - 1));

    const goPrev = () =>
        setCurrentStage((s) => Math.max(s - 1, 0));

    const handleViewSubmission = (participant, mission, submission) => {
        setSelectedSubmission({ participant, mission, submission });
    };

    const closeModal = () => setSelectedSubmission(null);

    const updateSubmissionStatus = (id, status) => {
        const reviewedAt = new Date().toISOString();

        setSubmissions((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, status, reviewedAt } : s
            )
        );

        setSelectedSubmission((prev) =>
            prev && prev.submission.id === id
                ? {
                      ...prev,
                      submission: { ...prev.submission, status, reviewedAt }
                  }
                : prev
        );
    };

    const handleApprove = (id) => updateSubmissionStatus(id, "approved");
    const handleReject = (id) => updateSubmissionStatus(id, "rejected");

    return (
        <div className="active-itinerary-page">
            <h1 className="page-title">Transylvania Explorer</h1>

            <ProgressBar stages={stages} currentStage={currentStage} />

            <div className="nav-buttons">
                <button
                    className="nav-btn prev"
                    onClick={goPrev}
                    disabled={currentStage === 0}
                >
                    ← Previous
                </button>

                <button
                    className="nav-btn next"
                    onClick={goNext}
                    disabled={currentStage === stages.length - 1}
                >
                    Next →
                </button>
            </div>

            <div className="stage-content">
                {currentStage === 0 && (
                    <ParticipantList participants={participants} />
                )}

                {currentStage > 0 && currentStage < stages.length - 1 && (
                    <MissionList
                        missions={currentLocationMissions}
                        participants={participants}
                        submissions={submissions}
                        onViewSubmission={handleViewSubmission}
                    />
                )}

                {currentStage === stages.length - 1 && (
                    <FeedbackList
                        participants={participants}
                        feedback={feedback}
                    />
                )}
            </div>

            {selectedSubmission && (
                <MissionModal
                    mission={selectedSubmission.mission}
                    participant={selectedSubmission.participant}
                    submission={selectedSubmission.submission}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
