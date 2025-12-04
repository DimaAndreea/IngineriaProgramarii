package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*; // Sau javax.persistence dacă folosești Spring Boot mai vechi (<3.0)
import lombok.Data; // Dacă folosești Lombok, altfel generează Getters/Setters
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "itinerary")
@Data // Lombok pentru a scuti boilerplate code
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

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "itinerary_start_date", nullable = false)
    private LocalDate itineraryStartDate;

    @Column(name = "itinerary_end_date", nullable = false)
    private LocalDate itineraryEndDate;

    // Relația cu User (Creatorul)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
}