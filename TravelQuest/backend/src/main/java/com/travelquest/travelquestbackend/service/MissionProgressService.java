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

@Service
public class MissionProgressService {

    private static final Logger logger = LoggerFactory.getLogger(MissionProgressService.class);

    private final MissionParticipationRepository participationRepository;
    private final ObjectiveSubmissionRepository submissionRepository;
    private final ItineraryRepository itineraryRepository;

    public MissionProgressService(
            MissionParticipationRepository participationRepository,
            ObjectiveSubmissionRepository submissionRepository,
            ItineraryRepository itineraryRepository
    ) {
        this.participationRepository = participationRepository;
        this.submissionRepository = submissionRepository;
        this.itineraryRepository = itineraryRepository;
    }

    // ============================================================
    // SCHEDULER: actualizează toate misiunile IN_PROGRESS
    // ============================================================
    @Scheduled(fixedRate = 10000)
    public void updateAllMissionsProgressLoop() {
        List<MissionParticipation> participations =
                participationRepository.findByStatusIn(List.of(MissionParticipationStatus.IN_PROGRESS));

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
    // LOGICA PRINCIPALĂ: update progress
    // ============================================================
    @Transactional
    public void updateProgress(Long userId, Long missionId) {

        MissionParticipation participation =
                participationRepository.findByMission_IdAndUser_Id(missionId, userId)
                        .orElseThrow(() -> new IllegalStateException("MissionParticipation not found"));

        if (participation.getStatus() != MissionParticipationStatus.IN_PROGRESS) {
            return;
        }

        Mission mission = participation.getMission();

        int currentValue = calculateCurrentValue(userId, mission);
        int targetValue = mission.getTargetValue();
        int progressPercent = calculateProgressPercent(currentValue, targetValue);

        participation.setProgress(progressPercent);

        // Dacă misiunea a fost completată
        if (currentValue >= targetValue) {
            participation.setStatus(MissionParticipationStatus.COMPLETED);
            participation.setCompletedAt(ZonedDateTime.now().toLocalDateTime());
        }

        participationRepository.save(participation);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    private int calculateCurrentValue(Long userId, Mission mission) {
        return switch (mission.getType()) {
            case "TOURIST_JOIN_ITINERARY_COUNT" -> itineraryRepository.countUserJoinedItineraries(userId);
            case "TOURIST_APPROVED_SUBMISSIONS_COUNT" -> (int) submissionRepository.countByTouristAndStatus(userId, SubmissionStatus.APPROVED);
            case "GUIDE_PUBLISH_ITINERARY_COUNT" -> itineraryRepository.countPublishedByUser(userId);
            case "GUIDE_EVALUATE_SUBMISSIONS_COUNT" -> (int) submissionRepository.countEvaluatedByGuide(userId);
            default -> 0;
        };
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
                new User(userId), // user simplificat pentru query
                List.of(MissionParticipationStatus.COMPLETED, MissionParticipationStatus.CLAIMED)
        );

        List<RewardDto> rewards = new ArrayList<>();
        for (MissionParticipation p : participations) {
            Mission mission = p.getMission();
            Reward reward = mission.getReward();

            RewardDto dto = new RewardDto();
            dto.setId(reward != null ? reward.getId() : null);
            dto.setTitle(reward != null ? reward.getTitle() : "Reward");
            dto.setFromMissionTitle(mission.getTitle());

            // ✅ Conversie LocalDateTime → ZonedDateTime în zona locală
            if (p.getClaimedAt() != null) {
                dto.setClaimedAt(p.getClaimedAt().atZone(ZoneId.systemDefault()));
            } else {
                dto.setClaimedAt(null);
            }

            rewards.add(dto);
        }

        logger.info("📦 getUserRewards → userId={} → {} rewards", userId, rewards.size());
        return rewards;
    }

}
