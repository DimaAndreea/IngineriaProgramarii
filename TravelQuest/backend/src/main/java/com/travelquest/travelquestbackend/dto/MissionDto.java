package com.travelquest.travelquestbackend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.travelquest.travelquestbackend.model.MissionStatus;
import com.travelquest.travelquestbackend.model.MissionScope;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MissionDto {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDate deadline;

    @NotNull
    @Min(0)
    @JsonProperty("reward_points")
    private Integer rewardPoints;

    @NotNull
    private MissionStatus status;

    @NotNull
    private MissionScope scope;

    // Getters & setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
    public MissionStatus getStatus() { return status; }
    public void setStatus(MissionStatus status) { this.status = status; }
    public MissionScope getScope() { return scope; }
    public void setScope(MissionScope scope) { this.scope = scope; }
}
