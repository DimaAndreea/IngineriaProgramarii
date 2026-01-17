package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionScope;
import com.travelquest.travelquestbackend.model.MissionStatus;
import com.travelquest.travelquestbackend.model.Reward;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class MissionService {

    private final MissionRepository missionRepository;
    private final ObjectMapper objectMapper;

    public MissionService(MissionRepository missionRepository, ObjectMapper objectMapper) {
        this.missionRepository = missionRepository;
        this.objectMapper = objectMapper;
    }

    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    public Mission createMission(MissionDto dto, Long creatorId) {
        System.out.println("=== CREATE MISSION REQUEST ===");
        System.out.println("Title: " + dto.getTitle());
        System.out.println("Description: " + dto.getDescription());
        System.out.println("StartAt: " + dto.getStartAt());
        System.out.println("EndAt: " + dto.getEndAt());
        System.out.println("Role: " + dto.getRole());
        System.out.println("Type: " + dto.getType());
        System.out.println("TargetValue: " + dto.getTargetValue());
        System.out.println("Params: " + dto.getParams());
        System.out.println("Reward: " + dto.getReward());
        System.out.println("=============================");

        // ===============================
        // Creează obiectul Mission
        // ===============================
        Mission mission = new Mission();
        mission.setTitle(dto.getTitle());
        mission.setDescription(dto.getDescription());
        mission.setCreatorId(creatorId);

        // ===============================
        // Parse start_at / end_at
        // ===============================
        if (dto.getStartAt() != null) {
            mission.setStartAt(ZonedDateTime.parse(dto.getStartAt()).toLocalDateTime());
        }
        if (dto.getEndAt() != null) {
            mission.setEndAt(ZonedDateTime.parse(dto.getEndAt()).toLocalDateTime());
        } else {
            mission.setEndAt(LocalDateTime.now().plusDays(7)); // default 7 zile
        }

        mission.setRole(dto.getRole());
        mission.setType(dto.getType());
        mission.setTargetValue(dto.getTargetValue());

        // ===============================
        // Convert params Map -> JSON
        // ===============================
        if (dto.getParams() != null && !dto.getParams().isEmpty()) {
            try {
                mission.setParamsJson(objectMapper.writeValueAsString(dto.getParams()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid params JSON", e);
            }
        }

        // ===============================
        // Set reward și rewardPoints
        // ===============================
        if (dto.getReward() != null) {
            Reward reward = new Reward();
            reward.setXpReward(dto.getReward().getXpReward());
            reward.setTitle(dto.getReward().getRealRewardTitle());
            reward.setDescription(dto.getReward().getRealRewardDescription());

            // Bidirecțional
            reward.setMission(mission);
            mission.setReward(reward);

            // Set rewardPoints obligatoriu
            mission.setRewardPoints(dto.getReward().getXpReward());
        } else {
            // Default 0 dacă nu există reward
            mission.setRewardPoints(0);
        }

        // ===============================
        // Set status și scope cu valori default
        // ===============================
        mission.setStatus(MissionStatus.DRAFT);     // default dacă DTO nu are status
        mission.setScope(MissionScope.BOTH);        // default dacă DTO nu are scope

        return missionRepository.save(mission);
    }
}
