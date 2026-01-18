package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MissionValidationResultDto {

    @JsonProperty("mission_id")
    private Long missionId;

    @JsonProperty("user_id")
    private Long userId;

    private String status; // COMPLETED, REJECTED, IN_PROGRESS

    @JsonProperty("xp_awarded")
    private int xpAwarded;

    public MissionValidationResultDto() {}

    public MissionValidationResultDto(Long missionId, Long userId, String status, int xpAwarded) {
        this.missionId = missionId;
        this.userId = userId;
        this.status = status;
        this.xpAwarded = xpAwarded;
    }

    // getters și setters
    public Long getMissionId() { return missionId; }
    public void setMissionId(Long missionId) { this.missionId = missionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getXpAwarded() { return xpAwarded; }
    public void setXpAwarded(int xpAwarded) { this.xpAwarded = xpAwarded; }
}
