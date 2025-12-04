package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "itinerary_id")
    private Long itineraryId;

    @Column(nullable = false, length = 20)
    private String title;

    @Column(length = 100)
    private String description;

    @Column(length = 20)
    private String category;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private Integer price = 0;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(20) default 'DRAFT'")
    private ItineraryStatus status = ItineraryStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "itinerary_start_date", nullable = false)
    private LocalDate itineraryStartDate;

    @Column(name = "itinerary_end_date", nullable = false)
    private LocalDate itineraryEndDate;

    // --- RELAȚII ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnore
    private User creator;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItineraryLocation> locations = new ArrayList<>();

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ObjectiveMission> missions = new ArrayList<>();

    public Itinerary() {
    }

    // --- GETTERS & SETTERS ---

    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long itineraryId) { this.itineraryId = itineraryId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public ItineraryStatus getStatus() { return status; }
    public void setStatus(ItineraryStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDate getItineraryStartDate() { return itineraryStartDate; }
    public void setItineraryStartDate(LocalDate itineraryStartDate) { this.itineraryStartDate = itineraryStartDate; }

    public LocalDate getItineraryEndDate() { return itineraryEndDate; }
    public void setItineraryEndDate(LocalDate itineraryEndDate) { this.itineraryEndDate = itineraryEndDate; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public List<ItineraryLocation> getLocations() { return locations; }
    public void setLocations(List<ItineraryLocation> locations) { this.locations = locations; }

    public List<ObjectiveMission> getMissions() { return missions; }
    public void setMissions(List<ObjectiveMission> missions) { this.missions = missions; }
}