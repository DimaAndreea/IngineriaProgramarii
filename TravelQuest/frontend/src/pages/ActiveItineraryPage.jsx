import React, { useState, useEffect, useMemo } from "react";
import "./ActiveItineraryPage.css";

import ProgressBar from "../components/itineraries/active/ProgressBar";
import ItineraryHeader from "../components/itineraries/active/ItineraryHeader";
import ParticipantList from "../components/itineraries/active/ParticipantList";
import MissionList from "../components/itineraries/active/MissionList";
import FeedbackList from "../components/itineraries/active/FeedbackList";
import MissionModal from "../components/itineraries/active/MissionModal";

import {
  getActiveItinerariesForGuide,
  updateSubmissionStatus as apiUpdateSubmissionStatus,
  getSubmissionsForGuide,
} from "../services/itineraryService";

export default function ActiveItineraryPage() {
  const [itineraryId, setItineraryId] = useState(null);

  const [title, setTitle] = useState("");
  const [stages, setStages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [missions, setMissions] = useState([]); // array de array-uri pe locații
  const [submissions, setSubmissions] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // ✅ păstrăm și datele necesare pt "context itinerary"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locations, setLocations] = useState([]);

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------- LOAD FROM BACKEND ----------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const list = await getActiveItinerariesForGuide();

        if (!list || list.length === 0) {
          setError("No active itinerary for today.");
          setItineraryId(null);
          setStages([]);
          setParticipants([]);
          setMissions([]);
          setSubmissions([]);
          setFeedback([]);
          setLocations([]);
          setStartDate(null);
          setEndDate(null);
          setCurrentStage(0);
          return;
        }

        const active = list[0];

        setItineraryId(active.id);
        setTitle(active.title || "Active itinerary");

        // ✅ pt context itinerary
        setStartDate(active.startDate || null);
        setEndDate(active.endDate || null);
        setLocations(Array.isArray(active.locations) ? active.locations : []);

        const locationStages = Array.isArray(active.locations)
          ? active.locations.map((loc, idx) => {
              if (loc.city && loc.country) return `${loc.city}`;
              if (loc.city) return loc.city;
              if (loc.name) return loc.name;
              return `Location #${idx + 1}`;
            })
          : [];

        setStages(["Participants", ...locationStages, "Feedback"]);

        setParticipants(active.participants || []);

        const missionsPerLocation = Array.isArray(active.locations)
          ? active.locations.map((loc) => loc.objectives || [])
          : [];
        setMissions(missionsPerLocation);

        setFeedback(active.feedback || []);

        // ✅ DEBUG: Log participants și feedback
        console.log("🎯 Participants:", active.participants);
        console.log("💬 Feedback:", active.feedback);

        // ✅ submissions pentru ghid (istoric inclus)
        try {
          const subs = await getSubmissionsForGuide(active.id);
          setSubmissions(subs || []);
        } catch (e) {
          console.error("Failed to load guide submissions:", e);
          setSubmissions([]);
        }

        setCurrentStage(0);
      } catch (err) {
        console.error("Failed to load active itinerary:", err);
        setError(err.message || "Failed to load active itinerary.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------------------- DERIVED DATA ----------------------
  const currentLocationMissions =
    currentStage > 0 && currentStage < stages.length - 1
      ? missions[currentStage - 1] || []
      : [];

  // ✅ context itinerary trimis către ParticipantList (pentru profil public turist)
  const contextItinerary = useMemo(() => {
    if (!itineraryId) return null;
    return {
      id: itineraryId,
      title: title || "Itinerary",
      startDate,
      endDate,
      locations: Array.isArray(locations) ? locations : [],
    };
  }, [itineraryId, title, startDate, endDate, locations]);

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
    if (!itineraryId) {
      console.warn("No itineraryId set for updateSubmissionStatus");
      return;
    }

    const sid = Number(submissionId);

    try {
      // 1) PATCH status
      await apiUpdateSubmissionStatus(itineraryId, sid, status);
      
      // 📡 Notify Missions page to refresh immediately
      window.dispatchEvent(new Event("submissionEvaluated"));

      // 2) ✅ refetch submissions ca să se actualizeze badge-ul din listă
      const fresh = await getSubmissionsForGuide(itineraryId);
      const freshList = fresh || [];
      setSubmissions(freshList);

      // 3) dacă modalul e deschis pe submission-ul ăsta, actualizează-l
      setSelectedSubmission((prev) => {
        if (!prev) return prev;
        if (Number(prev.submission?.id) !== sid) return prev;

        const updated = freshList.find((s) => Number(s.id) === sid);
        return updated ? { ...prev, submission: updated } : prev;
      });
    } catch (err) {
      console.error("Failed to update submission status:", err);
    }
  };

  // ⚠️ IMPORTANT: backend enum e APPROVED / REJECTED
  const handleApprove = (id) => updateSubmissionStatus(id, "APPROVED");
  const handleReject = (id) => updateSubmissionStatus(id, "REJECTED");

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
      <ItineraryHeader title={title} startDate={startDate} endDate={endDate} />

      <ProgressBar stages={stages} currentStage={currentStage} />

      <div className="nav-buttons">
        <button className="nav-btn prev" onClick={goPrev} disabled={currentStage === 0}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>

        <button
          className="nav-btn next"
          onClick={goNext}
          disabled={stages.length === 0 || currentStage === stages.length - 1}
        >
          Next
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="stage-content">
        {currentStage === 0 && (
          <ParticipantList participants={participants} contextItinerary={contextItinerary} />
        )}

        {currentStage > 0 && currentStage < stages.length - 1 && (
          <MissionList
            missions={currentLocationMissions}
            participants={participants}
            submissions={submissions}
            onViewSubmission={handleViewSubmission}
          />
        )}

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
