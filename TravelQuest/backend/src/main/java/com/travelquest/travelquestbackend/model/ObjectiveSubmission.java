package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "objective_submission")
public class ObjectiveSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Long id;

    // Turistul care face submissia
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User tourist;

    // Obiectivul pentru care se face submissia
    @ManyToOne
    @JoinColumn(name = "objective_id", nullable = false)
    private ItineraryObjective objective;

    // Ghidul care validează submissia
    @ManyToOne
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    // URL-ul sau calea către fișierul trimis
    @Column(name = "submission_url", nullable = false)
    private String submissionUrl;

    // Mapare enum Java la PostgreSQL enum
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @org.hibernate.annotations.ColumnTransformer(
            write = "?::submission_status"
    )
    private SubmissionStatus status = SubmissionStatus.PENDING;



    @Column(name = "submitted_at", nullable = false)
    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @Column(name = "validated_at")
    private ZonedDateTime validatedAt;

    // ======================
    // Getters & Setters
    // ======================
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }

    public ItineraryObjective getObjective() { return objective; }
    public void setObjective(ItineraryObjective objective) { this.objective = objective; }

    public User getGuide() { return guide; }
    public void setGuide(User guide) { this.guide = guide; }

    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }

    public ZonedDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(ZonedDateTime submittedAt) { this.submittedAt = submittedAt; }

    public ZonedDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(ZonedDateTime validatedAt) { this.validatedAt = validatedAt; }

    // ======================
    // toString pentru debugging
    // ======================
    @Override
    public String toString() {
        return "ObjectiveSubmission{" +
                "id=" + id +
                ", tourist=" + (tourist != null ? tourist.getUsername() : "null") +
                ", objectiveId=" + (objective != null ? objective.getId() : "null") +
                ", guide=" + (guide != null ? guide.getUsername() : "null") +
                ", submissionUrl='" + submissionUrl + '\'' +
                ", status=" + status +
                ", submittedAt=" + submittedAt +
                ", validatedAt=" + validatedAt +
                '}';
    }
}
