package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Map;

public class MissionDto {

    private String code;

    private String title;

    private String description;

    @JsonProperty("start_at")
    private String startAt;  // ISO string

    @JsonProperty("end_at")
    @NotBlank
    private String endAt;    // ISO string

    @NotBlank
    private String role;

    @NotBlank
    private String type;

    @JsonProperty("target_value")
    @Min(1)
    private Integer targetValue;

    private Map<String, Object> params;

    @JsonProperty("reward")
    private RewardInMissionDto reward;

    // Nested DTO pentru reward în mission creation
    public static class RewardInMissionDto {
        @JsonProperty("real_reward_title")
        private String title;
        
        @JsonProperty("xp_reward")
        private Integer xpReward;
        
        @JsonProperty("real_reward_description")
        private String description;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public Integer getXpReward() { return xpReward; }
        public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // Getters & setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartAt() { return startAt; }
    public void setStartAt(String startAt) { this.startAt = startAt; }

    public String getEndAt() { return endAt; }
    public void setEndAt(String endAt) { this.endAt = endAt; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getTargetValue() { return targetValue; }
    public void setTargetValue(Integer targetValue) { this.targetValue = targetValue; }

    public Map<String, Object> getParams() { return params; }
    public void setParams(Map<String, Object> params) { this.params = params; }

    public RewardInMissionDto getReward() { return reward; }
    public void setReward(RewardInMissionDto reward) { this.reward = reward; }
}
