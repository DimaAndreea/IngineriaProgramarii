package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "itinerary_participant",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"itinerary_id", "tourist_id"})})
public class ItineraryParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonBackReference
    private Itinerary itinerary;

    @ManyToOne
    @JoinColumn(name = "tourist_id", nullable = false)
    private User tourist;

    @Column(name = "joined_at", nullable = false)
    private ZonedDateTime joinedAt = ZonedDateTime.now();

    // GETTERS + SETTERS
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Itinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(Itinerary itinerary) {
        this.itinerary = itinerary;
    }

    public User getTourist() {
        return tourist;
    }

    public void setTourist(User tourist) {
        this.tourist = tourist;
    }

    public ZonedDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(ZonedDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
