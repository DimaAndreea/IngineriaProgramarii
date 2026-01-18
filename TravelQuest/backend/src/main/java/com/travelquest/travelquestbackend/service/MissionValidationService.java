package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionValidationDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.MissionClaimRepository;
import com.travelquest.travelquestbackend.repository.UserMissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionValidationService {

    private final UserMissionRepository userMissionRepository;
    private final PointsService pointsService;
    private final MissionClaimRepository missionClaimRepository;

    public MissionValidationService(UserMissionRepository userMissionRepository,
                                    PointsService pointsService,
                                    MissionClaimRepository missionClaimRepository) {
        this.userMissionRepository = userMissionRepository;
        this.pointsService = pointsService;
        this.missionClaimRepository = missionClaimRepository;
    }

    /**
     * Validare finalizare misiune.
     */
    @Transactional
    public MissionValidationDto validateMissionCompletion(Long userId, Long missionId) {
        UserMission userMission = userMissionRepository
                .findByUserIdAndMissionId(userId, missionId)
                .orElseThrow(() -> new EntityNotFoundException("UserMission not found"));

        Mission mission = userMission.getMission();
        boolean approved = userMission.getProgressValue() >= mission.getTargetValue();

        int pointsAwarded = 0;

        if (approved) {
            // 1) mark as completed / claimed
            userMission.setState("COMPLETED");
            userMission.setCompletedAt(java.time.LocalDateTime.now());
            userMissionRepository.save(userMission);

            // 2) acordare puncte
            pointsAwarded = pointsService.addPointsForObjectiveApproved(
                    userId,
                    mission.getRewardPoints(),
                    userMission.getAnchorItineraryId(),
                    null,
                    null
            );

            // 3) log claim
            if (!missionClaimRepository.existsByUserIdAndMissionId(userId, missionId)) {
                MissionClaim claim = new MissionClaim();
                claim.setUserId(userId);
                claim.setMission(mission);
                missionClaimRepository.save(claim);
            }

            return new MissionValidationDto(true, pointsAwarded);
        } else {
            // respins
            userMission.setState("IN_PROGRESS"); // sau "FAILED" dacă vrei
            userMissionRepository.save(userMission);
            return new MissionValidationDto(false, 0);
        }
    }
}
