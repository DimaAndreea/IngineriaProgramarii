package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.SubmissionRepository;
import com.travelquest.travelquestbackend.repository.UserMissionItineraryRepository;
import com.travelquest.travelquestbackend.repository.UserMissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionProgressService {

    private final UserMissionRepository userMissionRepository;
    private final UserMissionItineraryRepository userMissionItineraryRepository;
    private final SubmissionRepository submissionRepository;
    private final ItineraryRepository itineraryRepository;
    private final MissionParticipationService missionParticipationService;

    public MissionProgressService(
            UserMissionRepository userMissionRepository,
            UserMissionItineraryRepository userMissionItineraryRepository,
            SubmissionRepository submissionRepository,
            ItineraryRepository itineraryRepository,
            MissionParticipationService missionParticipationService
    ) {
        this.userMissionRepository = userMissionRepository;
        this.userMissionItineraryRepository = userMissionItineraryRepository;
        this.submissionRepository = submissionRepository;
        this.itineraryRepository = itineraryRepository;
        this.missionParticipationService = missionParticipationService;
    }

    /**
     * Actualizează progresul utilizatorului pentru o misiune.
     * Dacă progresul ajunge la 100%, auto-claim și returnează reward-ul.
     */
    @Transactional
    public RewardDto updateProgressForUser(Long userId, Long missionId) {
        UserMission userMission = userMissionRepository
                .findByUserIdAndMissionId(userId, missionId)
                .orElseThrow(() -> new RuntimeException("UserMission not found"));

        Mission mission = userMission.getMission();
        int progress = calculateProgress(userId, userMission, mission);

        userMission.setProgressValue(progress);
        userMissionRepository.save(userMission);

        // Dacă progresul >= 100%, completăm misiunea și auto-claim
        if (progress >= 100) {
            userMission.setState("COMPLETED");
            userMission.setCompletedAt(java.time.LocalDateTime.now());
            userMissionRepository.save(userMission);

            // Creează participarea și auto-claim
            MissionParticipation participation = new MissionParticipation();
            participation.setMission(mission);
            participation.setUser(userMission.getUser());
            participation.setStatus("COMPLETED");
            participation.setProgress(100);

            return missionParticipationService.autoClaim(participation, userMission.getUser());
        }

        return null; // nu s-a completat încă, deci nici reward
    }

    // ==========================
    // CALCULATE PROGRESS
    // ==========================
    private int calculateProgress(Long userId, UserMission userMission, Mission mission) {
        int progress = 0;

        switch (mission.getType()) {
            case "TOURIST_JOIN_ITINERARY_COUNT":
                progress = userMissionItineraryRepository.countByUserMissionId(userMission.getId());
                break;
            case "TOURIST_APPROVED_SUBMISSIONS_COUNT":
                progress = submissionRepository.countApprovedByUser(userId);
                break;
            case "TOURIST_JOIN_ITINERARY_CATEGORY_COUNT":
                String category = extractCategoryFromParams(mission.getParamsJson());
                progress = userMissionItineraryRepository.countByUserMissionIdAndCategory(userMission.getId(), category);
                break;
            case "TOURIST_APPROVED_SUBMISSIONS_CATEGORY_COUNT":
                category = extractCategoryFromParams(mission.getParamsJson());
                progress = submissionRepository.countApprovedByUserAndCategory(userId, category);
                break;
            case "TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT":
                Long itineraryId = extractItineraryIdFromParams(mission.getParamsJson());
                progress = submissionRepository.countApprovedByUserAndItinerary(userId, itineraryId);
                break;

            case "GUIDE_PUBLISH_ITINERARY_COUNT":
                progress = itineraryRepository.countPublishedByUser(userId);
                break;
            case "GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT":
                category = extractCategoryFromParams(mission.getParamsJson());
                progress = itineraryRepository.countParticipantsInCategoryByUser(userId, category);
                break;
            case "GUIDE_EVALUATE_SUBMISSIONS_COUNT":
                progress = submissionRepository.countEvaluatedByUser(userId);
                break;

            default:
                progress = 0;
        }

        return progress;
    }

    // ==========================
    // HELPER METHODS
    // ==========================
    private String extractCategoryFromParams(String paramsJson) {
        if (paramsJson == null || paramsJson.isEmpty()) return null;
        try {
            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(paramsJson);
            if (node.has("category")) return node.get("category").asText();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private Long extractItineraryIdFromParams(String paramsJson) {
        if (paramsJson == null || paramsJson.isEmpty()) return null;
        try {
            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(paramsJson);
            if (node.has("itinerary")) return node.get("itinerary").asLong();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
