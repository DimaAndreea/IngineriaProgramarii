package com.travelquest.travelquestbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.MissionStatus;
import com.travelquest.travelquestbackend.model.Reward;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MissionService {

    private static final Logger log = LoggerFactory.getLogger(MissionService.class);

    private final MissionRepository missionRepository;
    private final MissionParticipationRepository participationRepository;
    private final ObjectMapper objectMapper;

    public MissionService(MissionRepository missionRepository,
                          MissionParticipationRepository participationRepository,
                          ObjectMapper objectMapper) {
        this.missionRepository = missionRepository;
        this.participationRepository = participationRepository;
        this.objectMapper = objectMapper;
    }

    // ===============================
    // GET ALL MISSIONS (WITH USER DATA)
    // ===============================
    public List<MissionForUserDto> getAllMissionsForUser(Long userId) {
        Iterable<Mission> missions = missionRepository.findAll();
        List<MissionForUserDto> result = new ArrayList<>();

        for (Mission mission : missions) {
            MissionForUserDto dto = new MissionForUserDto();
            dto.setId(mission.getId());
            dto.setTitle(mission.getTitle());
            dto.setDescription(mission.getDescription());
            dto.setRole(mission.getRole());
            dto.setType(mission.getType());
            dto.setTarget(mission.getTargetValue());

            // Reward
            dto.setReward(mapRewardToDto(mission.getReward()));

            // User-specific data
            if (userId != null) {
                Optional<MissionParticipation> participation =
                        participationRepository.findByMission_IdAndUser_Id(mission.getId(), userId);

                participation.ifPresentOrElse(mp -> {
                    dto.setMyProgress(mp.getProgress());
                    dto.setMyStatus(mp.getStatus().name());
                    dto.setClaimedAt(mp.getClaimedAt()); // LocalDateTime compatibil
                }, () -> {
                    dto.setMyProgress(0);
                    dto.setMyStatus("PENDING");
                    dto.setClaimedAt(null);
                });
            }

            result.add(dto);
        }

        return result;
    }

    // ===============================
    // CREATE MISSION
    // ===============================
    public Mission createMission(MissionDto dto, Long creatorId) {

        log.info("🛠️ Creating mission: title='{}', role={}, type={}",
                dto.getTitle(), dto.getRole(), dto.getType());

        Mission mission = new Mission();
        mission.setTitle(dto.getTitle());
        mission.setDescription(dto.getDescription());
        mission.setCreatorId(creatorId);

        // Start / End
        if (dto.getStartAt() != null) {
            mission.setStartAt(LocalDateTime.parse(dto.getStartAt()));
        }
        if (dto.getEndAt() != null) {
            mission.setEndAt(LocalDateTime.parse(dto.getEndAt()));
        } else {
            mission.setEndAt(LocalDateTime.now().plusDays(7));
        }

        mission.setRole(dto.getRole());
        mission.setType(dto.getType());
        mission.setTargetValue(dto.getTargetValue());

        // Params JSON
        if (dto.getParams() != null && !dto.getParams().isEmpty()) {
            try {
                mission.setParamsJson(objectMapper.writeValueAsString(dto.getParams()));
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid params JSON", e);
            }
        }

        // Reward
        if (dto.getReward() != null) {
            Reward reward = new Reward();
            reward.setTitle(dto.getReward().getTitle() != null ? dto.getReward().getTitle() : "Voucher");
            reward.setMission(mission);
            mission.setReward(reward);
            mission.setRewardPoints(reward.getXpReward());
        } else {
            mission.setRewardPoints(0);
        }

        mission.setStatus(MissionStatus.DRAFT);

        return missionRepository.save(mission);
    }

    // ===============================
    // Reward → DTO mapping
    // ===============================
    public RewardDto mapRewardToDto(Reward reward) {
        if (reward == null) return null;

        RewardDto dto = new RewardDto();
        dto.setId(reward.getId());
        dto.setTitle(reward.getTitle());
        dto.setFromMissionTitle(reward.getMission() != null ? reward.getMission().getTitle() : null);
        dto.setClaimedAt(null); // claimedAt depinde de participarea utilizatorului
        return dto;
    }

    // ===============================
    // DTO FOR FRONTEND
    // ===============================
    public static class MissionForUserDto {
        private Long id;
        private String title;
        private String description;
        private String role;
        private String type;
        private int target;

        private int myProgress;
        private String myStatus;
        private LocalDateTime claimedAt; // LocalDateTime compatibil cu backend

        private RewardDto reward;

        // Getters & Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getTarget() { return target; }
        public void setTarget(int target) { this.target = target; }
        public int getMyProgress() { return myProgress; }
        public void setMyProgress(int myProgress) { this.myProgress = myProgress; }
        public String getMyStatus() { return myStatus; }
        public void setMyStatus(String myStatus) { this.myStatus = myStatus; }
        public LocalDateTime getClaimedAt() { return claimedAt; }
        public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }
        public RewardDto getReward() { return reward; }
        public void setReward(RewardDto reward) { this.reward = reward; }
    }
}
