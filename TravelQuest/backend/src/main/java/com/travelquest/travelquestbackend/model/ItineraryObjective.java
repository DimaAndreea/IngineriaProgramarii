package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "itinerary_objective")
public class ItineraryObjective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "objective_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    @JsonBackReference   // PREVINE recursia cu Location
    private ItineraryLocation location;

    @Column(name = "objective_name")
    private String name;

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItineraryLocation getLocation() { return location; }
    public void setLocation(ItineraryLocation location) { this.location = location; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
