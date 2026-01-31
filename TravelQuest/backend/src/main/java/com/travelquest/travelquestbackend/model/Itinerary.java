package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "itinerary_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Convert(converter = ItineraryCategoryConverter.class)
    @Column(name = "category")
    private ItineraryCategory category;


    @Column(name = "image_base64", columnDefinition = "TEXT")
    private String imageBase64;

    @Column(nullable = false)
    private Integer price = 0;

    @Convert(converter = ItineraryStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ItineraryStatus status;

    @Column(name = "itinerary_start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "itinerary_end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ItineraryLocation> locations = new ArrayList<>();


    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ItineraryParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Feedback> feedback = new ArrayList<>();

    public List<ItineraryParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ItineraryParticipant> participants) {
        this.participants = participants;
    }

    public List<Feedback> getFeedback() {
        return feedback;
    }

    public void setFeedback(List<Feedback> feedback) {
        this.feedback = feedback;
    }

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = ItineraryStatus.PENDING;
        }
    }

    // GETTERS + SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ItineraryCategory getCategory() {
        return category;
    }

    public void setCategory(ItineraryCategory category) {
        this.category = category;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public ItineraryStatus getStatus() {
        return status;
    }

    public void setStatus(ItineraryStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public List<ItineraryLocation> getLocations() {
        return locations;
    }

    public void setLocations(List<ItineraryLocation> locations) {
        this.locations = locations;
    }
}
