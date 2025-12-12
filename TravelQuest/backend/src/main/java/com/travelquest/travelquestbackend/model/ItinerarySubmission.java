package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
public class ItinerarySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @ManyToOne
    @JoinColumn(name = "tourist_id", nullable = false)
    private User tourist;

    @Lob
    @Column(nullable = false)
    private byte[] imageData;

    private String fileName;
    private String contentType;

    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.PENDING; // PENDING, APPROVED, REJECTED

    // Getters și Setters
    public Long getId() { return id; }
    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }
    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }
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

    // Enum pentru status
    public enum SubmissionStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
