package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionParticipationDto;
import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.GamifiedActionType;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserPointsHistory;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import com.travelquest.travelquestbackend.repository.UserPointsHistoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MissionParticipationService {

    private final MissionRepository missionRepository;
    private final MissionParticipationRepository participationRepository;
    private final UserPointsHistoryRepository pointsHistoryRepository;

    public MissionParticipationService(
            MissionRepository missionRepository,
            MissionParticipationRepository participationRepository,
            UserPointsHistoryRepository pointsHistoryRepository
    ) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
        this.pointsHistoryRepository = pointsHistoryRepository;
    }

    // ===============================
    // JOIN MISSION (TOURIST or GUIDE)
    // ===============================
    @Transactional
    public MissionParticipationDto joinMission(Long missionId, User user) {

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        // verificăm dacă rolul utilizatorului corespunde rolului misiunii
        if (!mission.getRole().equalsIgnoreCase(user.getRole().name())) {
            throw new IllegalArgumentException(
                    "User role (" + user.getRole() + ") cannot join mission for role " + mission.getRole()
            );
        }

        boolean alreadyJoined = participationRepository.existsByMissionAndUser(mission, user);
        if (alreadyJoined) {
            throw new IllegalArgumentException("User already joined this mission");
        }

        // creăm participarea
        MissionParticipation participation = new MissionParticipation();
        participation.setMission(mission);
        participation.setUser(user);

        // pentru teste frontend: completăm automat misiunea
        participation.setStatus("COMPLETED");
        participation.setProgress(100);

        participationRepository.save(participation);

        // auto-claim imediat dacă e completă
        RewardDto reward = autoClaim(participation, user);

        return new MissionParticipationDto(
                mission.getId(),
                user.getId(),
                participation.getStatus(),
                participation.getProgress(),
                reward.getXpReward() // punctele acordate
        );
    }

    // ===============================
    // CLAIM MISSION MANUAL
    // ===============================
    @Transactional
    public RewardDto claimMission(Long missionId, User user) {
        MissionParticipation participation = participationRepository
                .findByMissionIdAndUserId(missionId, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Mission not joined")
                );

        if (!"COMPLETED".equals(participation.getStatus())) {
            throw new IllegalStateException("Mission not completed");
        }

        return autoClaim(participation, user);
    }

    // ===============================
    // AUTO-CLAIM (internal)
    // ===============================
    @Transactional
    public RewardDto autoClaim(MissionParticipation participation, User user) {

        // dacă nu e încă CLAIMED
        if (!"CLAIMED".equals(participation.getStatus())) {
            participation.setStatus("CLAIMED");
            participationRepository.save(participation);

            // salvăm punctele în user_points_history
            UserPointsHistory history = new UserPointsHistory();
            history.setUser(user);
            history.setPointsDelta(participation.getMission().getRewardPoints());
            history.setActionType(GamifiedActionType.OBJECTIVE_APPROVED);
            history.setObjectiveId(participation.getMission().getId());
            pointsHistoryRepository.save(history);
        }

        // returnăm reward
        RewardDto reward = new RewardDto();
        reward.setXpReward(participation.getMission().getRewardPoints());
        reward.setRealRewardTitle(participation.getMission().getTitle());
        reward.setRealRewardDescription("Mission completed and auto-claimed");

        return reward;
    }

    // ===============================
    // MY REWARDS
    // ===============================
    public List<RewardDto> getMyRewards(User user) {
        return participationRepository
                .findByUserAndStatus(user, "CLAIMED")
                .stream()
                .map(p -> {
                    RewardDto r = new RewardDto();
                    r.setXpReward(p.getMission().getRewardPoints());
                    r.setRealRewardTitle(p.getMission().getTitle());
                    r.setRealRewardDescription("Mission reward");
                    return r;
                })
                .toList();
    }
}
