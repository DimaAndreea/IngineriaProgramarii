package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "objective_mission")
@Data
public class ObjectiveMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "objective_mission_id")
    private Long objectiveMissionId;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(name = "reward_xp", nullable = false)
    private Integer rewardXp = 50;

    // Relația cu Itinerariul
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonIgnore
    private Itinerary itinerary;

    // Relația cu Locația specifică
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    @JsonIgnore
    private ItineraryLocation location;
}