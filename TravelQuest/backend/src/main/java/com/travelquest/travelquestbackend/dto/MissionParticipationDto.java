package com.travelquest.travelquestbackend.dto;

public class MissionParticipationDto {
    private Long missionId;
    private Long userId;
    private String status;      // "PENDING"
    private int progress;       // 0 la început

    public MissionParticipationDto() {}

    public MissionParticipationDto(Long missionId, Long userId, String status, int progress) {
        this.missionId = missionId;
        this.userId = userId;
        this.status = status;
        this.progress = progress;
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
}
