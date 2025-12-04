package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "itinerary_location")
@Data
public class ItineraryLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long locationId;

    @Column(nullable = false, length = 50)
    private String country;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(name = "objective_name", nullable = false, length = 100)
    private String objectiveName;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 1;

    // Relația cu Itinerariul părinte
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonIgnore // Important: Previne bucla infinită în JSON când serializăm
    private Itinerary itinerary;
}