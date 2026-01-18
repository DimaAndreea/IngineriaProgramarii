package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MissionParticipationDto {

    @JsonProperty("mission_id")
    private Long missionId;

    @JsonProperty("user_id")
    private Long userId;

    private String status;   // PENDING, COMPLETED, CLAIMED

    private int progress;    // 0..100

    @JsonProperty("xp_reward")
    private int xpReward;    // punctele câștigate (0 dacă nu a fost claim)

    public MissionParticipationDto() {
    }

    public MissionParticipationDto(
            Long missionId,
            Long userId,
            String status,
            int progress,
            int xpReward
    ) {
        this.missionId = missionId;
        this.userId = userId;
        this.status = status;
        this.progress = progress;
        this.xpReward = xpReward;
    }

    public Long getMissionId() {
        return missionId;
    }

    public void setMissionId(Long missionId) {
        this.missionId = missionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }
}
