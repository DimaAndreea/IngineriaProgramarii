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

    public MissionParticipationService(
            MissionRepository missionRepository,
            MissionParticipationRepository participationRepository,
            UserPointsHistoryRepository pointsHistoryRepository,
            UserRepository userRepository
    ) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
        this.pointsHistoryRepository = pointsHistoryRepository;
        this.userRepository = userRepository;
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

        // Marcam ca CLAIMED și salvăm timpul în LocalDateTime
        participation.setStatus(MissionParticipationStatus.CLAIMED);
        participation.setClaimedAt(LocalDateTime.now());
        participationRepository.save(participation);

        // Aplicăm XP reward, dacă există
        if (mission.getReward() != null) {

            int xpReward = mission.getReward().getXpReward();
            sessionUser.setXp(sessionUser.getXp() + xpReward);
            userRepository.save(sessionUser);

            UserPointsHistory history = new UserPointsHistory();
            history.setUser(user);
            history.setPointsDelta(mission.getReward().getXpReward());
            history.setActionType(GamifiedActionType.OBJECTIVE_APPROVED);
            history.setObjectiveId(mission.getId());
            pointsHistoryRepository.save(history);
        }

        // Mapare DTO → conversie LocalDateTime → ZonedDateTime
        RewardDto rewardDto = new RewardDto();
        rewardDto.setId(mission.getReward() != null ? mission.getReward().getId() : null);
        rewardDto.setTitle(mission.getReward() != null ? mission.getReward().getTitle() : "Reward");
        rewardDto.setFromMissionTitle(mission.getTitle());
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
                        ///MissionParticipationStatus.COMPLETED
                      MissionParticipationStatus.CLAIMED
                ));

        return participations.stream().map(p -> {
            Mission mission = p.getMission();
            Reward reward = mission.getReward();

            RewardDto dto = new RewardDto();
            dto.setId(reward != null ? reward.getId() : null);
            dto.setTitle(reward != null ? reward.getTitle() : "Reward");
            dto.setFromMissionTitle(mission.getTitle());
            dto.setClaimedAt(
                    p.getClaimedAt() != null
                            ? p.getClaimedAt().atZone(ZoneId.systemDefault())
                            : null
            );
            if (reward != null) {
                dto.setDescription(reward.getDescription());
            }
            return dto;
        }).collect(Collectors.toList());
    }

}