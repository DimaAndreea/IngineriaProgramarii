package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionParticipationDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionParticipationService {

    private final MissionRepository missionRepository;
    private final MissionParticipationRepository participationRepository;

    public MissionParticipationService(MissionRepository missionRepository,
                                       MissionParticipationRepository participationRepository) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
    }

    @Transactional
    public MissionParticipationDto joinMission(Long missionId, User user) {
        if (user.getRole() != UserRole.TOURIST) {
            throw new IllegalArgumentException("Only tourists can join missions");
        }

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        boolean alreadyJoined = participationRepository.existsByMissionAndUser(mission, user);
        if (alreadyJoined) {
            throw new IllegalArgumentException("User already joined this mission");
        }

        MissionParticipation participation = new MissionParticipation();
        participation.setMission(mission);
        participation.setUser(user);
        participation.setStatus("PENDING");
        participation.setProgress(0);

        participationRepository.save(participation);

        return new MissionParticipationDto(
                mission.getId(),
                user.getId(),
                participation.getStatus(),
                participation.getProgress()
        );
    }
}
