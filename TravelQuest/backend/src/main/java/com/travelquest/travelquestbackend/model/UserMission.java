package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_missions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mission_id"})
)
public class UserMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_mission_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @Column(nullable = false)
    private String state = "IN_PROGRESS"; // IN_PROGRESS / COMPLETED / CLAIMED

    @Column(name = "progress_value", nullable = false)
    private Integer progressValue = 0;

    @Column(name = "anchor_itinerary_id")
    private Long anchorItineraryId;

    @Column(name = "started_at")
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Mission getMission() { return mission; }
    public void setMission(Mission mission) { this.mission = mission; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Integer getProgressValue() { return progressValue; }
    public void setProgressValue(Integer progressValue) { this.progressValue = progressValue; }

    public Long getAnchorItineraryId() { return anchorItineraryId; }
    public void setAnchorItineraryId(Long anchorItineraryId) { this.anchorItineraryId = anchorItineraryId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }
}