package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_missions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"mission_id", "user_id"})
)
public class MissionParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_mission_id")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private MissionParticipationStatus status = MissionParticipationStatus.IN_PROGRESS;

    @Column(name = "progress_value", nullable = false)
    private int progress = 0;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "anchor_itinerary_id")
    private Long anchorItineraryId;

    // ======================
    // Getters & Setters
    // ======================

    public Long getId() { return id; }

    public Mission getMission() { return mission; }
    public void setMission(Mission mission) { this.mission = mission; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public MissionParticipationStatus getStatus() { return status; }
    public void setStatus(MissionParticipationStatus status) { this.status = status; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }

    public Long getAnchorItineraryId() { return anchorItineraryId; }
    public void setAnchorItineraryId(Long anchorItineraryId) { this.anchorItineraryId = anchorItineraryId; }
}
