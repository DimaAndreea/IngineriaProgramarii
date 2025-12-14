package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(
        name = "objective_submission",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "objective_id"})
)
public class ItinerarySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Long id;

    // opțional: păstrăm itineraryId (ca în codul tău), dar îl putem deduce și din objective
    @ManyToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @ManyToOne
    @JoinColumn(name = "objective_id", nullable = false)
    private ItineraryObjective objective;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User tourist;

    @ManyToOne
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    @Lob
    @Column(name = "image_data", nullable = false)
    private byte[] imageData;

    private String fileName;
    private String contentType;

    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @Convert(converter = SubmissionStatusConverter.class)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    // Getters/setters
    public Long getId() { return id; }

    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }

    public ItineraryObjective getObjective() { return objective; }
    public void setObjective(ItineraryObjective objective) { this.objective = objective; }

    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }

    public User getGuide() { return guide; }
    public void setGuide(User guide) { this.guide = guide; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public ZonedDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(ZonedDateTime submittedAt) { this.submittedAt = submittedAt; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
}
