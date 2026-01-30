package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.ObjectiveSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MissionProgressService {

    private static final Logger logger = LoggerFactory.getLogger(MissionProgressService.class);

    private final MissionParticipationRepository participationRepository;
    private final ObjectiveSubmissionRepository submissionRepository;
    private final ItineraryRepository itineraryRepository;
    private final ObjectMapper objectMapper; // pentru parsarea params_json

    public MissionProgressService(
            MissionParticipationRepository participationRepository,
            ObjectiveSubmissionRepository submissionRepository,
            ItineraryRepository itineraryRepository,
            ObjectMapper objectMapper
    ) {
        this.participationRepository = participationRepository;
        this.submissionRepository = submissionRepository;
        this.itineraryRepository = itineraryRepository;
        this.objectMapper = objectMapper;
    }

    // ============================================================
    // SCHEDULER: actualizează toate misiunile IN_PROGRESS
    // ============================================================
    @Scheduled(fixedRate = 10000)
    public void updateAllMissionsProgressLoop() {
        List<MissionParticipation> participations =
                participationRepository.findByStatusIn(List.of(MissionParticipationStatus.IN_PROGRESS));

        logger.info("\n====================\nUpdating all IN_PROGRESS missions\nTotal: {}\n====================",
                participations.size());

        for (MissionParticipation mp : participations) {
            try {
                updateProgress(mp.getUser().getId(), mp.getMission().getId());
            } catch (Exception e) {
                logger.error(
                        "Failed to update progress for user {} mission {}",
                        mp.getUser().getId(),
                        mp.getMission().getId(),
                        e
                );
            }
        }
    }

    // ============================================================
    // UPDATE PROGRESS
    // ============================================================
    @Transactional
    public void updateProgress(Long userId, Long missionId) {
        MissionParticipation participation =
                participationRepository.findByMission_IdAndUser_Id(missionId, userId)
                        .orElseThrow(() -> new IllegalStateException("MissionParticipation not found"));

        if (participation.getStatus() != MissionParticipationStatus.IN_PROGRESS) return;

        Mission mission = participation.getMission();

        int currentValue = calculateCurrentValue(userId, mission);
        int targetValue = mission.getTargetValue();
        int progressPercent = calculateProgressPercent(currentValue, targetValue);

        logger.info("\n====================\nMission Progress Update\n--------------------\n" +
                        "User ID       : {}\n" +
                        "Mission ID    : {}\n" +
                        "Title         : '{}'\n" +
                        "Target Value  : {}\n" +
                        "Current Value : {}\n" +
                        "Progress (%)  : {}\n" +
                        "Status        : {}\n====================",
                userId, missionId, mission.getTitle(), targetValue, currentValue, progressPercent, participation.getStatus());

        participation.setProgress(progressPercent);

        if (currentValue >= targetValue) {
            participation.setStatus(MissionParticipationStatus.COMPLETED);
            participation.setCompletedAt(ZonedDateTime.now().toLocalDateTime());
            logger.info("\n====================\n✅ Mission COMPLETED\nUser ID  : {}\nMission ID : {}\nTitle     : '{}'\n====================",
                    userId, missionId, mission.getTitle());
        }

        participationRepository.save(participation);
    }

    // ============================================================
    // CALCULATE CURRENT VALUE (SUPORTA TOATE 8 TIPURI)
    // ============================================================
    private int calculateCurrentValue(Long userId, Mission mission) {
        String type = mission.getType();

        try {
            JsonNode params = mission.getParamsJson() != null
                    ? objectMapper.readTree(mission.getParamsJson())
                    : null;

            return switch (type) {
                // ------------------------
                // TOURIST MISSIONS
                // ------------------------
                case "TOURIST_JOIN_ITINERARY_COUNT" ->
                        itineraryRepository.countUserJoinedItineraries(userId);

                case "TOURIST_JOIN_ITINERARY_CATEGORY_COUNT" -> {
                    String category = params != null && params.has("category") ? params.get("category").asText() : null;
                    if (category != null) {
                        yield itineraryRepository.countUserJoinedItinerariesByCategory(userId, category);
                    } else {
                        yield itineraryRepository.countUserJoinedItineraries(userId);
                    }
                }

//
//                case "TOURIST_APPROVED_SUBMISSIONS_CATEGORY_COUNT" -> {
//                    String category = params != null && params.has("category") ? params.get("category").asText() : null;
//                    if (category != null) {
//                        yield submissionRepository.countByTouristAndStatusAndCategory(userId, SubmissionStatus.APPROVED, category);
//                    } else {
//                        yield submissionRepository.countByTouristAndStatus(userId, SubmissionStatus.APPROVED);
//                    }
//                }
//
                case "TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT" -> {
                    Long itineraryId = params != null && params.has("itineraryId") ? params.get("itineraryId").asLong() : null;
                    if (itineraryId != null) {
                        yield (int) submissionRepository.countByTouristAndStatusAndItinerary(userId, SubmissionStatus.APPROVED, itineraryId);
                    } else {
                        yield 0;
                    }
                }


                // ------------------------
                // GUIDE MISSIONS
                // ------------------------
                case "GUIDE_PUBLISH_ITINERARY_COUNT" ->
                        itineraryRepository.countPublishedByUser(userId);

                case "GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT" -> {
                    String category = params != null && params.has("category") ? params.get("category").asText() : null;
                    if (category != null) {
                        yield itineraryRepository.countParticipantsInCategoryByUser(userId, category);
                    } else {
                        yield itineraryRepository.countPublishedByUser(userId);
                    }
                }

                case "GUIDE_EVALUATE_SUBMISSIONS_COUNT" ->
                        (int) submissionRepository.countEvaluatedByGuide(userId);

                default -> 0;
            };
        } catch (Exception e) {
            logger.error("Error parsing params_json for mission {}: {}", mission.getId(), e.getMessage());
            return 0;
        }
    }


    private int calculateProgressPercent(int current, int target) {
        if (target <= 0) return 0;
        return Math.min(100, (current * 100) / target);
    }

    // ============================================================
    // GET USER REWARDS (COMPLETED & CLAIMED)
    // ============================================================
    @Transactional(readOnly = true)
    public List<RewardDto> getUserRewards(Long userId) {
        List<MissionParticipation> participations = participationRepository.findByUserAndStatusIn(
                new User(userId),
                List.of(MissionParticipationStatus.COMPLETED, MissionParticipationStatus.CLAIMED)
        );

        logger.info("\n====================\nFetching user rewards\nUser ID: {}\nParticipations found: {}\n====================",
                userId, participations.size());

        List<RewardDto> rewards = new ArrayList<>();
        for (MissionParticipation p : participations) {
            Mission mission = p.getMission();
            Reward reward = mission.getReward();

            int progressPercent = calculateProgressPercent(p.getProgress(), mission.getTargetValue());

            logger.info("\n--------------------\n🎯 Mission Details\n" +
                            "Mission ID    : {}\n" +
                            "Title         : '{}'\n" +
                            "Status        : {}\n" +
                            "Target Value  : {}\n" +
                            "Current Value : {}\n" +
                            "Progress (%)  : {}\n--------------------",
                    mission.getId(), mission.getTitle(), p.getStatus(), mission.getTargetValue(), p.getProgress(), progressPercent
            );

            RewardDto dto = new RewardDto();
            dto.setId(reward != null ? reward.getId() : null);
            dto.setTitle(reward != null ? reward.getTitle() : "Reward");
            dto.setFromMissionTitle(mission.getTitle());

            if (p.getClaimedAt() != null) {
                dto.setClaimedAt(p.getClaimedAt().atZone(ZoneId.systemDefault()));
            } else {
                dto.setClaimedAt(null);
            }

            rewards.add(dto);
        }

        logger.info("\n====================\nUser rewards prepared\nUser ID: {}\nTotal Rewards: {}\n====================",
                userId, rewards.size());

        return rewards;
    }
}
