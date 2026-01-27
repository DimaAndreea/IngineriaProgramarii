package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    // ================================
    // Basic queries
    // ================================
    List<Itinerary> findByCreatorId(Long creatorId);

    List<Itinerary> findByStatus(ItineraryStatus status);

    // ================================
    // Active itineraries for guide
    // ================================
    @Query("""
        SELECT i 
        FROM Itinerary i
        WHERE i.creator.id = :creatorId
        AND i.startDate <= :today
        AND i.endDate >= :today
        AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
    """)
    List<Itinerary> findActiveItinerariesForGuide(
            @Param("creatorId") Long creatorId,
            @Param("today") LocalDate today
    );

    // ================================
    // Overlapping check for guide
    // ================================
    @Query("""
        SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END
        FROM Itinerary i
        WHERE i.creator.id = :creatorId
          AND i.status <> com.travelquest.travelquestbackend.model.ItineraryStatus.REJECTED
          AND i.startDate <= :newEndDate
          AND i.endDate >= :newStartDate
    """)
    boolean existsOverlappingItineraryForGuide(
            @Param("creatorId") Long creatorId,
            @Param("newStartDate") LocalDate newStartDate,
            @Param("newEndDate") LocalDate newEndDate
    );

    @Query("""
        SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END
        FROM Itinerary i
        WHERE i.creator.id = :creatorId
          AND i.status <> com.travelquest.travelquestbackend.model.ItineraryStatus.REJECTED
          AND i.id <> :itineraryId
          AND i.startDate <= :newEndDate
          AND i.endDate >= :newStartDate
    """)
    boolean existsOverlappingItineraryForGuideExcludingItinerary(
            @Param("creatorId") Long creatorId,
            @Param("itineraryId") Long itineraryId,
            @Param("newStartDate") LocalDate newStartDate,
            @Param("newEndDate") LocalDate newEndDate
    );

    // ================================
    // Active itineraries for tourist
    // ================================
    @Query("""
        SELECT i
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :touristId
          AND i.startDate <= :today
          AND i.endDate >= :today
          AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
    """)
    List<Itinerary> findActiveItinerariesForTourist(
            @Param("touristId") Long touristId,
            @Param("today") LocalDate today
    );

    // ================================
    // Counting methods for missions
    // ================================

    // ---- TOURIST ----

    // Total itineraries joined by user
    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :userId
          AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
    """)
    int countUserJoinedItineraries(@Param("userId") Long userId);

    // Total itineraries joined by user in a specific category
    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :userId
          AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
          AND i.category = :category
    """)
    int countUserJoinedItinerariesByCategory(@Param("userId") Long userId, @Param("category") String category);

    // ---- GUIDE ----

    // Total itineraries published by user
    @Query("SELECT COUNT(i) FROM Itinerary i WHERE i.creator.id = :userId")
    int countPublishedByUser(@Param("userId") Long userId);

    // Total itineraries published by user in a specific category
    @Query("SELECT COUNT(i) FROM Itinerary i WHERE i.creator.id = :userId AND i.category = :category")
    int countPublishedByUserAndCategory(@Param("userId") Long userId, @Param("category") String category);

    // Total participants in itineraries published by guide in a category
    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE i.creator.id = :userId
          AND i.category = :category
    """)
    int countParticipantsInCategoryByUser(@Param("userId") Long userId, @Param("category") String category);

    // Count participants in a specific itinerary
    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE i.id = :itineraryId
    """)
    int countParticipantsInItinerary(@Param("itineraryId") Long itineraryId);
}
