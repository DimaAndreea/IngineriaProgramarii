package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "user_mission_itineraries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_mission_id", "itinerary_id"})
)
public class UserMissionItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relație către UserMission
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_mission_id", nullable = false)
    private UserMission userMission;

    // Relație către Itinerary (obiect real, nu doar ID)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false, insertable = false, updatable = false)
    private Itinerary itinerary;

    // Păstrăm și itineraryId pentru insert/update
    @Column(name = "itinerary_id", nullable = false)
    private Long itineraryId;

    // Constructori
    public UserMissionItinerary() {}

    public UserMissionItinerary(UserMission userMission, Long itineraryId) {
        this.userMission = userMission;
        this.itineraryId = itineraryId;
    }

    // Getters și Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserMission getUserMission() { return userMission; }
    public void setUserMission(UserMission userMission) { this.userMission = userMission; }

    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }

    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long itineraryId) { this.itineraryId = itineraryId; }
}
