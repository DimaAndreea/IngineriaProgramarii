package com.travelquest.travelquestbackend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary_location")
public class ItineraryLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonBackReference   // PREVINE recursia cu Itinerary
    private Itinerary itinerary;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "city", nullable = false)
    private String city;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference    // parent pentru objectives
    private List<ItineraryObjective> objectives = new ArrayList<>();

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<ItineraryObjective> getObjectives() { return objectives; }
    public void setObjectives(List<ItineraryObjective> objectives) { this.objectives = objectives; }
}
