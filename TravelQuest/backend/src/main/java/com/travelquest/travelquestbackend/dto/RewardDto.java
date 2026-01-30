package com.travelquest.travelquestbackend.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class RewardDto {

    private Long id;
    private String title;

    /**
     * Trimitem către frontend cu timezone (ISO 8601)
     * ex: 2025-03-10T14:30:00+02:00
     */
    private ZonedDateTime claimedAt;

    private String fromMissionTitle;

    // =========================
    // Constructors
    // =========================

    public RewardDto() {}

    /**
     * Constructor SAFE pentru JPQL / service
     * Acceptă LocalDateTime din entity și îl convertește automat
     */
    public RewardDto(
            Long id,
            String title,
            LocalDateTime claimedAt,
            String fromMissionTitle
    ) {
        this.id = id;
        this.title = title;
        this.claimedAt = claimedAt != null
                ? claimedAt.atZone(ZoneId.systemDefault())
                : null;
        this.fromMissionTitle = fromMissionTitle;
    }

    /**
     * Constructor direct cu ZonedDateTime (opțional)
     */
    public RewardDto(
            Long id,
            String title,
            ZonedDateTime claimedAt,
            String fromMissionTitle
    ) {
        this.id = id;
        this.title = title;
        this.claimedAt = claimedAt;
        this.fromMissionTitle = fromMissionTitle;
    }

    // =========================
    // Getters & Setters
    // =========================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ZonedDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(ZonedDateTime claimedAt) { this.claimedAt = claimedAt; }

    public String getFromMissionTitle() { return fromMissionTitle; }
    public void setFromMissionTitle(String fromMissionTitle) {
        this.fromMissionTitle = fromMissionTitle;
    }
}
