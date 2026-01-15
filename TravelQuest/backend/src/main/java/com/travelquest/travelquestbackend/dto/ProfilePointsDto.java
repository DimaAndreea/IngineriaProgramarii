package com.travelquest.travelquestbackend.dto;

public class ProfilePointsDto {

    private int xp;

    public ProfilePointsDto() {}

    public ProfilePointsDto(int xp) {
        this.xp = xp;
    }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }
}
