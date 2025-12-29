package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MissionService {

    private final MissionRepository missionRepository;

    public MissionService(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    public Mission createMission(MissionDto dto, Long creatorId) {
        System.out.println("=== CREATE MISSION REQUEST ===");
        System.out.println("Title: " + dto.getTitle());
        System.out.println("Description: " + dto.getDescription());
        System.out.println("Deadline: " + dto.getDeadline());
        System.out.println("RewardPoints: " + dto.getRewardPoints());
        System.out.println("Status: " + dto.getStatus());
        System.out.println("Scope: " + dto.getScope());
        System.out.println("=============================");

        Mission mission = new Mission();
        mission.setTitle(dto.getTitle());
        mission.setDescription(dto.getDescription());
        mission.setDeadline(dto.getDeadline());
        mission.setRewardPoints(dto.getRewardPoints());
        mission.setStatus(dto.getStatus());
        mission.setScope(dto.getScope());
        mission.setCreatorId(creatorId);
        return missionRepository.save(mission);
    }
}
