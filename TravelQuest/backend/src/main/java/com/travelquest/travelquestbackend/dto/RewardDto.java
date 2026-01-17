package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RewardDto {

    @JsonProperty("xp_reward")
    private int xpReward;

    @JsonProperty("real_reward_title")
    private String realRewardTitle;

    @JsonProperty("real_reward_description")
    private String realRewardDescription;

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public String getRealRewardTitle() {
        return realRewardTitle;
    }

    public void setRealRewardTitle(String realRewardTitle) {
        this.realRewardTitle = realRewardTitle;
    }

    public String getRealRewardDescription() {
        return realRewardDescription;
    }

    public void setRealRewardDescription(String realRewardDescription) {
        this.realRewardDescription = realRewardDescription;
    }
}
