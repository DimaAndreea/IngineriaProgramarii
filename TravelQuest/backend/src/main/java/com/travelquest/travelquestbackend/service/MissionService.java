package com.travelquest.travelquestbackend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.MissionScope;
import com.travelquest.travelquestbackend.model.MissionStatus;
import com.travelquest.travelquestbackend.model.Reward;
import com.travelquest.travelquestbackend.repository.MissionParticipationRepository;
import com.travelquest.travelquestbackend.repository.MissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
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
            // Setează datele de start și end
            dto.setStartAt(mission.getStartAt());
            dto.setEndAt(mission.getEndAt());

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
                    dto.setMyStatus("NOT_JOINED");
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
        mission.setCode(dto.getCode());
        mission.setTitle(dto.getTitle());
        mission.setDescription(dto.getDescription());
        mission.setCreatorId(creatorId);

        // Start / End - parse ISO 8601 with timezone
        if (dto.getStartAt() != null && !dto.getStartAt().trim().isEmpty()) {
            try {
                mission.setStartAt(OffsetDateTime.parse(dto.getStartAt()).toLocalDateTime());
            } catch (Exception e) {
                // Fallback to LocalDateTime if no timezone
                mission.setStartAt(LocalDateTime.parse(dto.getStartAt()));
            }
        }
        if (dto.getEndAt() != null && !dto.getEndAt().trim().isEmpty()) {
            try {
                mission.setEndAt(OffsetDateTime.parse(dto.getEndAt()).toLocalDateTime());
            } catch (Exception e) {
                // Fallback to LocalDateTime if no timezone
                mission.setEndAt(LocalDateTime.parse(dto.getEndAt()));
            }
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

        // Setare scope bazat pe rol
        if ("TOURIST".equalsIgnoreCase(dto.getRole())) {
            mission.setScope(MissionScope.TOURIST);
        } else if ("GUIDE".equalsIgnoreCase(dto.getRole())) {
            mission.setScope(MissionScope.GUIDE);
        } else {
            mission.setScope(MissionScope.BOTH);
        }

        // Reward
        if (dto.getReward() != null) {
            Reward reward = new Reward();
            reward.setTitle(dto.getReward().getTitle() != null ? dto.getReward().getTitle() : "Voucher");

            // Setare XP reward din DTO
            Integer xpReward = dto.getReward().getXpReward() != null ? dto.getReward().getXpReward() : 0;
            reward.setXpReward(xpReward);

            // Setare travel coins reward din DTO
            Integer travelCoinsReward = dto.getReward().getTravelCoinsReward() != null ? dto.getReward().getTravelCoinsReward() : 0;
            reward.setTravelCoinsReward(travelCoinsReward);

            // Setare description dacă există
            if (dto.getReward().getDescription() != null) {
                reward.setDescription(dto.getReward().getDescription());
            }

            reward.setMission(mission);
            mission.setReward(reward);
            mission.setRewardPoints(xpReward);
        } else {
            mission.setRewardPoints(0);
        }

        mission.setStatus(MissionStatus.ACTIVE);

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
        dto.setDescription(reward.getDescription());
        dto.setXpReward(reward.getXpReward());
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
        
        @JsonProperty("target_value")
        private int target;

        @JsonProperty("progress_value")
        private int myProgress;
        
        @JsonProperty("my_state")
        private String myStatus;
        
        private LocalDateTime claimedAt; // LocalDateTime compatibil cu backend
        @JsonProperty("start_at")
        private LocalDateTime startAt;
        @JsonProperty("end_at")
        private LocalDateTime endAt;

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
        public LocalDateTime getStartAt() { return startAt; }
        public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
        public LocalDateTime getEndAt() { return endAt; }
        public void setEndAt(LocalDateTime endAt) { this.endAt = endAt; }
        public RewardDto getReward() { return reward; }
        public void setReward(RewardDto reward) { this.reward = reward; }
    }

    // ===============================
    // GET MISSION METADATA
    // ===============================
    public Object getMissionMetadata() {
        // Returnează metadata pentru frontend
        var metadata = new java.util.HashMap<String, Object>();
        
        // Roles
        metadata.put("roles", java.util.List.of("TOURIST", "GUIDE"));
        
        // Categories - get from ItineraryCategory enum
        var categories = new java.util.ArrayList<String>();
        for (com.travelquest.travelquestbackend.model.ItineraryCategory cat : 
             com.travelquest.travelquestbackend.model.ItineraryCategory.values()) {
            categories.add(cat.name());
        }
        metadata.put("categories", categories);
        
        // Mission types pentru fiecare rol
        var types = new java.util.ArrayList<java.util.Map<String, Object>>();
        
        // TOURIST types
        types.add(createTypeMetadata("TOURIST", "TOURIST_JOIN_ITINERARY_COUNT", 
            "Join itineraries", null));
        types.add(createTypeMetadata("TOURIST", "TOURIST_JOIN_ITINERARY_CATEGORY_COUNT",
            "Join itineraries of specific category", "category"));
        types.add(createTypeMetadata("TOURIST", "TOURIST_APPROVED_SUBMISSIONS_COUNT",
            "Get approved submissions", null));
        types.add(createTypeMetadata("TOURIST", "TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT",
            "Get approved submissions in same itinerary", null));
        
        // GUIDE types
        types.add(createTypeMetadata("GUIDE", "GUIDE_PUBLISH_ITINERARY_COUNT", 
            "Publish itineraries", null));
        types.add(createTypeMetadata("GUIDE", "GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT", 
            "Get participants in category itinerary", "category"));
        types.add(createTypeMetadata("GUIDE", "GUIDE_EVALUATE_SUBMISSIONS_COUNT", 
            "Evaluate submissions", null));
        
        metadata.put("types", types);
        
        return metadata;
    }
    
    private java.util.Map<String, Object> createTypeMetadata(
            String role, String value, String label, String categoryParam) {
        var type = new java.util.HashMap<String, Object>();
        type.put("role", role);
        type.put("value", value);
        type.put("label", label);
        
        if (categoryParam != null) {
            var paramsSchema = new java.util.HashMap<String, Boolean>();
            paramsSchema.put(categoryParam, true);
            type.put("paramsSchema", paramsSchema);
        }
        
        return type;
    }
}