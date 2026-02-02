import React, { useEffect, useMemo, useState } from "react";
import {
  getActiveItineraryForTourist,
  submitFeedbackForGuide,
} from "../../../../services/activeItineraryTouristService";
import { getItineraryById } from "../../../../services/itineraryService";
import { uploadSubmission } from "../../../../services/submissionService";

import ProgressBar from "../../active/ProgressBar";
import ItineraryHeader from "../../active/ItineraryHeader";
import MissionListTourist from "./MissionListTourist";
import SubmissionModal from "./SubmissionModal";
import TouristFeedbackForm from "./TouristFeedbackForm";

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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [guideDetails, setGuideDetails] = useState({ id: null, name: null });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

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
        
          // Check dacă turistul a dat deja feedback
          if (data?.feedback) {
            setFeedbackSubmitted(true);
            setExistingFeedback(data.feedback);
          }
      } catch (err) {
        console.error("Failed to load active itinerary:", err);
        setLoadError(normalizeErrorMessage(err?.message));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGuideDetails() {
      if (!itinerary?.id) return;

      try {
        const details = await getItineraryById(itinerary.id);
        if (!isActive) return;

        setGuideDetails({
          id: details?.creator?.id ?? null,
          name: details?.creator?.username ?? null,
        });

        // Update itinerary cu date complete dacă nu le avem deja
        setItinerary(prev => ({
          ...prev,
          startDate: prev?.startDate || details?.startDate,
          endDate: prev?.endDate || details?.endDate,
        }));
      } catch (err) {
        console.error("Failed to load itinerary details for guide:", err);
      }
    }

    loadGuideDetails();

    return () => {
      isActive = false;
    };
  }, [itinerary?.id]);

  const clearSubmitMessages = () => {
    setSubmitError("");
    setSubmitSuccess("");
  };

    // Calculăm numărul total de etape: locații + feedback
    const totalStages = (itinerary?.locations?.length || 0) + 1;
  
  const goNext = () =>
      setCurrentStageIndex((prev) => Math.min(prev + 1, totalStages - 1));

  const goPrev = () => setCurrentStageIndex((prev) => Math.max(prev - 1, 0));

  // Map: objectiveId -> [submissions]
  const submissionsByMission = useMemo(() => {
    return (submissions || []).reduce((acc, sub) => {
      const key =
        sub.objectiveId ??
        sub.missionId ??
        sub.objective?.id ??
        sub.mission?.id;

      if (!key) return acc;

      if (!acc[key]) acc[key] = [];
      acc[key].push(sub);
      return acc;
    }, {});
  }, [submissions]);

  const openSubmissionModal = (mission) => {
    clearSubmitMessages();

    const objectiveId =
      mission?.id ?? mission?.objectiveId ?? mission?.objective_id;

    const alreadySubmitted = !!submissionsByMission[objectiveId]?.length;

    if (alreadySubmitted) {
      setSubmitError("You have already submitted a photo for this mission.");
      return;
    }

    setSelectedMission(mission);
  };

  const closeSubmissionModal = () => setSelectedMission(null);

  const handleSubmitPhoto = async (objectiveId, file) => {
    clearSubmitMessages();

    try {
      const updated = await uploadSubmission(itinerary.id, objectiveId, file);

      // backend poate întoarce: listă completă SAU un singur submission
      if (Array.isArray(updated)) {
        setSubmissions(updated);
      } else if (updated) {
        setSubmissions((prev) => [...prev, updated]);
      }

      setSubmitSuccess("Submission sent successfully!");
      setSelectedMission(null);
    } catch (err) {
      console.error("Failed to submit photo:", err);
      // arată mesajul real din backend dacă există
      setSubmitError(err?.message || "Failed to submit photo. Please try again.");
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    clearSubmitMessages();
    setFeedbackSubmitting(true);

    try {
      const saved = await submitFeedbackForGuide(itinerary.id, feedbackData);
      const storedFeedback = saved || feedbackData;

      setFeedbackSubmitted(true);
      setExistingFeedback(storedFeedback);
      setSubmitSuccess("Thank you for your feedback!");
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setSubmitError(err?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="active-itinerary-page">
        <h1 className="page-title">Active itinerary</h1>
        <p>Loading active itinerary...</p>
      </div>
    );

  if (loadError)
    return (
      <div className="active-itinerary-page">
        <h1 className="page-title">Active itinerary</h1>
        <p className="error-message">{loadError}</p>
      </div>
    );

  if (!itinerary)
    return (
      <div className="active-itinerary-page">
        <h1 className="page-title">Active itinerary</h1>
        <p>No active itinerary available.</p>
      </div>
    );

  const { title, locations = [] } = itinerary;
  
    // Verificăm dacă suntem pe etapa de feedback (ultima etapă)
    const isOnFeedbackStage = currentStageIndex === locations.length;
  
    const currentLocation = isOnFeedbackStage ? {} : (locations[currentStageIndex] || {});

  // suportă ambele: missions sau objectives
  const currentMissions =
    currentLocation.missions || currentLocation.objectives || [];
    
    // Creăm array-ul de stage-uri pentru ProgressBar (locații + feedback)
    const stageNames = [
      ...locations.map((loc, idx) => {
        if (loc.city && loc.country) return loc.city;
        if (loc.city) return loc.city;
        if (loc.name) return loc.name;
        return `Location ${idx + 1}`;
      }),
      "Feedback"
    ];

  const guideId =
    guideDetails.id ??
    itinerary?.guideId ??
    itinerary?.creatorId ??
    itinerary?.creator?.id ??
    itinerary?.guide?.id ??
    itinerary?.guide?.userId ??
    itinerary?.guide?.user_id ??
    null;

  const guideName =
    guideDetails.name ??
    itinerary?.guideUsername ??
    itinerary?.creatorName ??
    itinerary?.creator?.username ??
    itinerary?.guide?.username ??
    itinerary?.guide?.userName ??
    itinerary?.guide?.name ??
    itinerary?.guideName ??
    itinerary?.guideFullName ??
    null;

  return (
    <div className="active-itinerary-page">
      <ItineraryHeader title={title} startDate={itinerary?.startDate} endDate={itinerary?.endDate} />

      <ProgressBar stages={stageNames} currentStage={currentStageIndex} />

      <div className="nav-buttons">
        <button
          className="nav-btn prev"
          onClick={goPrev}
          disabled={currentStageIndex === 0}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>

        <button
          className="nav-btn next"
          onClick={goNext}
          disabled={currentStageIndex === totalStages - 1}
        >
          Next
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {submitError && (
        <div style={{ marginTop: 10 }}>
          <p className="error-message">{submitError}</p>
        </div>
      )}

      <div className="stage-content">
        {!isOnFeedbackStage ? (
          <MissionListTourist
            missions={currentMissions}
            submissionsByMission={submissionsByMission}
            onMakeSubmission={openSubmissionModal}
          />
        ) : (
          <TouristFeedbackForm
            guideId={guideId}
            guideName={guideName}
            onSubmit={handleSubmitFeedback}
            isSubmitting={feedbackSubmitting}
            hasFeedback={feedbackSubmitted}
            existingFeedback={existingFeedback}
          />
        )}
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
