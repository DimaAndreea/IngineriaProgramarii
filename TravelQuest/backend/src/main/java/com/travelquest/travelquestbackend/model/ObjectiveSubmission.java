package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "objective_submission")
public class ObjectiveSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User tourist;

    @ManyToOne
    @JoinColumn(name = "objective_id", nullable = false)
    private ItineraryObjective objective;

    @ManyToOne
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    @Column(name = "submission_base64", nullable = false, columnDefinition = "TEXT")
    private String submissionBase64;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    @org.hibernate.annotations.ColumnTransformer(write = "?::submission_status")
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "submitted_at", nullable = false)
    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @Column(name = "validated_at")
    private ZonedDateTime validatedAt;

    @Column(name = "xp_granted", nullable = false)
    private boolean xpGranted = false;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }

    public ItineraryObjective getObjective() { return objective; }
    public void setObjective(ItineraryObjective objective) { this.objective = objective; }

    public User getGuide() { return guide; }
    public void setGuide(User guide) { this.guide = guide; }

    public String getSubmissionBase64() { return submissionBase64; }
    public void setSubmissionBase64(String submissionBase64) { this.submissionBase64 = submissionBase64; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }

    public ZonedDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(ZonedDateTime submittedAt) { this.submittedAt = submittedAt; }

    public ZonedDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(ZonedDateTime validatedAt) { this.validatedAt = validatedAt; }

    public boolean isXpGranted() { return xpGranted; }
    public void setXpGranted(boolean xpGranted) { this.xpGranted = xpGranted; }

    @Override
    public String toString() {
        String preview = submissionBase64 == null ? "null"
                : submissionBase64.substring(0, Math.min(30, submissionBase64.length())) + "...";
        return "ObjectiveSubmission{" +
                "id=" + id +
                ", tourist=" + (tourist != null ? tourist.getUsername() : "null") +
                ", objectiveId=" + (objective != null ? objective.getId() : "null") +
                ", guide=" + (guide != null ? guide.getUsername() : "null") +
                ", xpReward=" + (objective != null ? objective.getXpReward() : "null") +
                ", xpGranted=" + xpGranted +
                ", submissionBase64='" + preview + '\'' +
                ", status=" + status +
                ", submittedAt=" + submittedAt +
                ", validatedAt=" + validatedAt +
                '}';
    }
}
