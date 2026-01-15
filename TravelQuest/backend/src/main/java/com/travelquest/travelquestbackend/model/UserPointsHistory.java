package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_points_history")
public class UserPointsHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private GamifiedActionType actionType;

    @Column(name = "points_delta", nullable = false)
    private int pointsDelta;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "itinerary_id")
    private Long itineraryId;

    @Column(name = "objective_id")
    private Long objectiveId;

    @Column(name = "submission_id")
    private Long submissionId;

    public UserPointsHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public GamifiedActionType getActionType() { return actionType; }
    public void setActionType(GamifiedActionType actionType) { this.actionType = actionType; }

    public int getPointsDelta() { return pointsDelta; }
    public void setPointsDelta(int pointsDelta) { this.pointsDelta = pointsDelta; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long itineraryId) { this.itineraryId = itineraryId; }

    public Long getObjectiveId() { return objectiveId; }
    public void setObjectiveId(Long objectiveId) { this.objectiveId = objectiveId; }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
}
