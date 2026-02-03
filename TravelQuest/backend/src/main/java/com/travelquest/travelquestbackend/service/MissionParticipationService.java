package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import com.travelquest.travelquestbackend.repository.UserPointsHistoryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MissionParticipationService {

    private final MissionRepository missionRepository;
    private final MissionParticipationRepository participationRepository;
    private final UserPointsHistoryRepository pointsHistoryRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public MissionParticipationService(
            MissionRepository missionRepository,
            MissionParticipationRepository participationRepository,
            UserPointsHistoryRepository pointsHistoryRepository,
            UserRepository userRepository,
            PointsService pointsService
    ) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
        this.pointsHistoryRepository = pointsHistoryRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    // ===============================
    // JOIN MISSION
    // ===============================
    @Transactional
    public MissionParticipation joinMission(Long missionId, User user) {

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        if (!mission.getRole().equalsIgnoreCase(user.getRole().name())) {
            throw new IllegalArgumentException(
                    "User role (" + user.getRole() + ") cannot join mission for role " + mission.getRole()
            );
        }

        boolean alreadyJoined = participationRepository.existsByMissionAndUser(mission, user);
        if (alreadyJoined) {
            throw new IllegalArgumentException("User already joined this mission");
        }

        MissionParticipation participation = new MissionParticipation();
        participation.setMission(mission);
        participation.setUser(user);
        participation.setStatus(MissionParticipationStatus.IN_PROGRESS);
        participation.setProgress(0);
        participation.setStartedAt(LocalDateTime.now());

        participationRepository.save(participation);

        return participation;
    }

    // ===============================
    // CLAIM MISSION
    // ===============================
    @Transactional
    public RewardDto claimMission(Long missionId, User user) {

        User sessionUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        MissionParticipation participation = participationRepository
                .findByMission_IdAndUser_Id(missionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Mission participation not found"));

        if (participation.getStatus() != MissionParticipationStatus.COMPLETED) {
            throw new IllegalStateException("Mission not completed yet");
        }

        Mission mission = participation.getMission();

        // Mark CLAIMED
        participation.setStatus(MissionParticipationStatus.CLAIMED);
        participation.setClaimedAt(LocalDateTime.now());
        participationRepository.save(participation);

        Reward reward = mission.getReward();

        // =========================
        // 1) XP reward (goes through PointsService -> recalculates level)
        // =========================
        if (reward != null) {
            int xpReward = reward.getXpReward();
            if (xpReward > 0) {
                pointsService.addPoints(
                        user.getId(),
                        xpReward,
                        GamifiedActionType.MISSION_CLAIM,
                        null,           // itineraryId
                        null,           // objectiveId
                        mission.getId() // missionId
                );
            }
        }

        // =========================
        // 2) Exposure/Fame points (stored in users.travel_coins) — GUIDE only
        // =========================
        if (reward != null) {
            int coinsReward = reward.getTravelCoinsReward();
            if (coinsReward > 0 && sessionUser.getRole() == UserRole.GUIDE) {
                sessionUser.setTravelCoins(sessionUser.getTravelCoins() + coinsReward);
                userRepository.save(sessionUser);
            }
        }

        // =========================
        // Response DTO
        // =========================
        RewardDto rewardDto = new RewardDto();
        rewardDto.setId(reward != null ? reward.getId() : null);
        rewardDto.setTitle(reward != null ? reward.getTitle() : "Reward");
        rewardDto.setFromMissionTitle(mission.getTitle());
        rewardDto.setDescription(reward != null ? reward.getDescription() : null);
        rewardDto.setXpReward(reward != null ? reward.getXpReward() : 0);
        rewardDto.setTravelCoinsReward(reward != null ? reward.getTravelCoinsReward() : 0);

        rewardDto.setClaimedAt(
                participation.getClaimedAt() != null
                        ? participation.getClaimedAt().atZone(ZoneId.systemDefault())
                        : null
        );

        return rewardDto;
    }

    // ===============================
    // GET MY REWARDS
    // ===============================
    @Transactional(readOnly = true)
    public List<RewardDto> getMyRewards(User user) {

        List<MissionParticipation> participations = participationRepository
                .findByUserAndStatusIn(user, List.of(
                        MissionParticipationStatus.CLAIMED
                ));

        return participations.stream().map(p -> {
            Mission mission = p.getMission();
            Reward reward = mission.getReward();

            RewardDto dto = new RewardDto();
            dto.setId(reward != null ? reward.getId() : null);
            dto.setTitle(reward != null ? reward.getTitle() : "Reward");
            dto.setDescription(reward != null ? reward.getDescription() : null);
            dto.setXpReward(reward != null ? reward.getXpReward() : 0);
            dto.setTravelCoinsReward(reward != null ? reward.getTravelCoinsReward() : 0);
            dto.setFromMissionTitle(mission.getTitle());
            dto.setClaimedAt(
                    p.getClaimedAt() != null
                            ? p.getClaimedAt().atZone(ZoneId.systemDefault())
                            : null
            );

            return dto;
        }).collect(Collectors.toList());
    }
}
