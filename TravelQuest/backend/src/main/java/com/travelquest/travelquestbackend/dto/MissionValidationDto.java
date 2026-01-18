package com.travelquest.travelquestbackend.dto;

public class MissionValidationDto {

    private boolean approved;
    private int pointsAwarded;

    public MissionValidationDto(boolean approved, int pointsAwarded) {
        this.approved = approved;
        this.pointsAwarded = pointsAwarded;
    }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public int getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(int pointsAwarded) { this.pointsAwarded = pointsAwarded; }
}
