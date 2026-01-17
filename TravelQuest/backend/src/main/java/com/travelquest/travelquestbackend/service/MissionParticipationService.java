package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionParticipationDto;
import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MissionParticipationService {

    private final MissionRepository missionRepository;
    private final MissionParticipationRepository participationRepository;

    public MissionParticipationService(
            MissionRepository missionRepository,
            MissionParticipationRepository participationRepository
    ) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
    }

    // ===============================
    // JOIN MISSION
    // ===============================
    @Transactional
    public MissionParticipationDto joinMission(Long missionId, User user) {

        if (user.getRole() != UserRole.TOURIST) {
            throw new IllegalArgumentException("Only tourists can join missions");
        }

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        boolean alreadyJoined =
                participationRepository.existsByMissionAndUser(mission, user);

        if (alreadyJoined) {
            throw new IllegalArgumentException("User already joined this mission");
        }

        MissionParticipation participation = new MissionParticipation();
        participation.setMission(mission);
        participation.setUser(user);
        participation.setStatus("COMPLETED"); // MOCK pentru frontend
        participation.setProgress(100);

        participationRepository.save(participation);

        return new MissionParticipationDto(
                mission.getId(),
                user.getId(),
                participation.getStatus(),
                participation.getProgress()
        );
    }

    // ===============================
    // CLAIM MISSION
    // ===============================
    @Transactional
    public RewardDto claimMission(Long missionId, User user) {

        MissionParticipation participation =
                participationRepository
                        .findByMissionIdAndUserId(missionId, user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException("Mission not joined")
                        );

        if (!"COMPLETED".equals(participation.getStatus())) {
            throw new IllegalStateException("Mission not completed");
        }

        participation.setStatus("CLAIMED");

        RewardDto reward = new RewardDto();
        reward.setXpReward(participation.getMission().getRewardPoints());
        reward.setRealRewardTitle(participation.getMission().getTitle());
        reward.setRealRewardDescription("Mission completed successfully");

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
