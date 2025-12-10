import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ActiveItineraryPage.css";

import ProgressBar from "../components/itineraries/active/ProgressBar";
import ParticipantList from "../components/itineraries/active/ParticipantList";
import MissionList from "../components/itineraries/active/MissionList";
import FeedbackList from "../components/itineraries/active/FeedbackList";
import MissionModal from "../components/itineraries/active/MissionModal";

import {
  getActiveItinerary,
  updateSubmissionStatus as apiUpdateSubmissionStatus,
} from "../services/itineraryService";

export default function ActiveItineraryPage() {
  // presupunem rută de tip /active-itinerary/:id (sau similar)
  const { id } = useParams();
  const itineraryId = id; // dacă nu există încă în router, va fi undefined

  const [title, setTitle] = useState("");
  const [stages, setStages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [missions, setMissions] = useState([]); // array de array-uri pe locații
  const [submissions, setSubmissions] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------- LOAD FROM BACKEND ----------------------
  useEffect(() => {
    if (!itineraryId) {
      // dacă nu avem id din URL, măcar nu aruncăm eroare
      setLoading(false);
      setError("No active itinerary selected.");
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        /**
         * Ne așteptăm ca backend-ul să trimită ceva de genul:
         * {
         *   id,
         *   title,
         *   stages: ["Created", "Brașov", "Sibiu", "Cluj", "Feedback"],
         *   participants: [...],
         *   missions: [ [ {id,text}, ... ], ... ], // index 0 = prima locație reală
         *   submissions: [...],
         *   feedback: [...]
         * }
         */
        const data = await getActiveItinerary(itineraryId);

        setTitle(data.title || "");
        setStages(data.stages || []);
        setParticipants(data.participants || []);
        setMissions(data.missions || []);
        setSubmissions(data.submissions || []);
        setFeedback(data.feedback || []);
        setCurrentStage(0);
      } catch (err) {
        console.error("Failed to load active itinerary:", err);
        setError(err.message || "Failed to load active itinerary.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [itineraryId]);

  // ---------------------- DERIVED DATA ----------------------
  const currentLocationMissions =
    currentStage > 0 && currentStage < stages.length - 1
      ? missions[currentStage - 1] || []
      : [];

  // ---------------------- NAVIGATION ----------------------
  const goNext = () =>
    setCurrentStage((s) => Math.min(s + 1, Math.max(stages.length - 1, 0)));

  const goPrev = () => setCurrentStage((s) => Math.max(s - 1, 0));

  // ---------------------- SUBMISSION MODAL ----------------------
  const handleViewSubmission = (participant, mission, submission) => {
    setSelectedSubmission({ participant, mission, submission });
  };

  const closeModal = () => setSelectedSubmission(null);

  // ---------------------- UPDATE SUBMISSION STATUS ----------------------
  const updateSubmissionStatus = async (submissionId, status) => {
    const reviewedAt = new Date().toISOString();

    try {
      // apel către backend – va fi implementat de colegă
      await apiUpdateSubmissionStatus(itineraryId, submissionId, status);
    } catch (err) {
      console.error("Failed to update submission status:", err);
      // poți pune aici un toast / mesaj de eroare în UI când vei avea un sistem de notificări
    }

    // actualizare optimistă în state (păstrăm exact funcționalitatea existentă)
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, status, reviewedAt } : s
      )
    );

    setSelectedSubmission((prev) =>
      prev && prev.submission.id === submissionId
        ? {
            ...prev,
            submission: { ...prev.submission, status, reviewedAt },
          }
        : prev
    );
  };

  const handleApprove = (id) => updateSubmissionStatus(id, "approved");
  const handleReject = (id) => updateSubmissionStatus(id, "rejected");

  // ---------------------- RENDER ----------------------
  if (loading) {
    return (
      <div className="active-itinerary-page">
        <h1 className="page-title">Active itinerary</h1>
        <p>Loading active itinerary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="active-itinerary-page">
        <h1 className="page-title">Active itinerary</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="active-itinerary-page">
      <h1 className="page-title">{title || "Active itinerary"}</h1>

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
          disabled={stages.length === 0 || currentStage === stages.length - 1}
        >
          Next →
        </button>
      </div>

      <div className="stage-content">
        {/* STAGE 0 → PARTICIPANTS */}
        {currentStage === 0 && (
          <ParticipantList participants={participants} />
        )}

        {/* STAGES INTERMEDIARE → MISSIONS */}
        {currentStage > 0 && currentStage < stages.length - 1 && (
          <MissionList
            missions={currentLocationMissions}
            participants={participants}
            submissions={submissions}
            onViewSubmission={handleViewSubmission}
          />
        )}

        {/* ULTIMUL STAGE → FEEDBACK */}
        {stages.length > 0 && currentStage === stages.length - 1 && (
          <FeedbackList participants={participants} feedback={feedback} />
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
