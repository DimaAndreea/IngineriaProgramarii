import React, { useEffect, useState } from "react";
import { getActiveItineraryForTourist } from "../../../../services/activeItineraryTouristService";
import { uploadSubmission } from "../../../../services/submissionService";

import ProgressBar from "../../active/ProgressBar";
import MissionListTourist from "./MissionListTourist";
import SubmissionModal from "./SubmissionModal";

import "../../../../pages/ActiveItineraryPage.css";

function normalizeErrorMessage(raw) {
  if (!raw) return "Something went wrong while loading your active itinerary.";
  if (raw.includes('"status":404') || raw.includes("Not Found")) {
    return "You don't have any active itinerary at the moment.";
  }
  return "Failed to load active itinerary. Please try again later.";
}

export default function ActiveItineraryTouristPage() {
  const [itinerary, setItinerary] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedMission, setSelectedMission] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getActiveItineraryForTourist();
        setItinerary(data || null);
        setCurrentStageIndex(data?.currentStageIndex ?? 0);
        setSubmissions(data?.submissions || []);
      } catch (err) {
        console.error("Failed to load active itinerary:", err);
        setLoadError(normalizeErrorMessage(err?.message));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const clearSubmitMessages = () => {
    setSubmitError("");
    setSubmitSuccess("");
  };

  const goNext = () => setCurrentStageIndex(prev => Math.min(prev + 1, itinerary.locations.length - 1));
  const goPrev = () => setCurrentStageIndex(prev => Math.max(prev - 1, 0));

  const openSubmissionModal = (mission) => {
    clearSubmitMessages();
    setSelectedMission(mission);
  };

  const closeSubmissionModal = () => setSelectedMission(null);

  const handleSubmitPhoto = async (objectiveId, file) => {
    clearSubmitMessages();
    try {
      const updatedSubmissions = await uploadSubmission(itinerary.id, objectiveId, file);
      setSubmissions(updatedSubmissions);
      setSubmitSuccess("Submission sent successfully!");
      setSelectedMission(null);
    } catch (err) {
      console.error("Failed to submit photo:", err);
      setSubmitError("Failed to submit photo. Please try again.");
    }
  };

  if (loading) return <div className="active-itinerary-page"><h1 className="page-title">Active itinerary</h1><p>Loading active itinerary...</p></div>;
  if (loadError) return <div className="active-itinerary-page"><h1 className="page-title">Active itinerary</h1><p className="error-message">{loadError}</p></div>;
  if (!itinerary) return <div className="active-itinerary-page"><h1 className="page-title">Active itinerary</h1><p>No active itinerary available.</p></div>;

  const { title, locations = [] } = itinerary;
  const currentLocation = locations[currentStageIndex] || {};
  const currentMissions = currentLocation.missions || [];

  // organizează submissions pe obiectiv
  const submissionsByMission = submissions.reduce((acc, sub) => {
    if (!acc[sub.objectiveId]) acc[sub.objectiveId] = [];
    acc[sub.objectiveId].push(sub);
    return acc;
  }, {});

  return (
      <div className="active-itinerary-page">
        <h1 className="page-title">{title || "Active itinerary"}</h1>

        <ProgressBar stages={locations} currentStage={currentStageIndex} />

        <div className="nav-buttons">
          <button className="nav-btn prev" onClick={goPrev} disabled={currentStageIndex === 0}>← Previous</button>
          <button className="nav-btn next" onClick={goNext} disabled={currentStageIndex === locations.length - 1}>Next →</button>
        </div>

        {(submitError || submitSuccess) && (
            <div style={{ marginTop: 10 }}>
              {submitError && <p className="error-message">{submitError}</p>}
              {submitSuccess && <p style={{ color: "#16a34a", fontWeight: 500 }}>{submitSuccess}</p>}
            </div>
        )}

        <div className="stage-content">
          <MissionListTourist
              missions={currentMissions}
              submissionsByMission={submissionsByMission}
              onMakeSubmission={openSubmissionModal}
          />
        </div>

        {selectedMission && (
            <SubmissionModal
                mission={selectedMission}
                onClose={closeSubmissionModal}
                onSubmit={handleSubmitPhoto}
            />
        )}
      </div>
  );
}
