package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import com.travelquest.travelquestbackend.model.ItineraryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.travelquest.travelquestbackend.model.SubmissionStatus;

import java.time.LocalDate;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    // ================================
    // Basic queries
    // ================================
    List<Itinerary> findByCreatorId(Long creatorId);

    List<Itinerary> findByStatus(ItineraryStatus status);

    /**
     * Public itineraries ordered by guide "exposure" points (users.travel_coins).
     * All itineraries from higher-scoring guides appear before those from lower-scoring guides.
     */
    @Query("""
        SELECT i
        FROM Itinerary i
        WHERE i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
        ORDER BY i.creator.travelCoins DESC, i.id DESC
    """)
    List<Itinerary> findPublicOrderedByGuideTravelCoins();

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

    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :userId
          AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
    """)
    int countUserJoinedItineraries(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :userId
          AND i.status = com.travelquest.travelquestbackend.model.ItineraryStatus.APPROVED
          AND i.category = :category
    """)
    int countUserJoinedItinerariesByCategory(
            @Param("userId") Long userId,
            @Param("category") ItineraryCategory category
    );

    // ---- GUIDE ----

    @Query("SELECT COUNT(i) FROM Itinerary i WHERE i.creator.id = :userId")
    int countPublishedByUser(@Param("userId") Long userId);

    @Query(value = """
        SELECT COUNT(*)
        FROM itinerary
        WHERE creator_id = :userId
          AND category::text = :category
    """, nativeQuery = true)
    int countPublishedByUserAndCategory(@Param("userId") Long userId, @Param("category") String category);

    @Query(value = """
        SELECT COUNT(p.participant_id)
        FROM itinerary i
        JOIN itinerary_participant p ON i.itinerary_id = p.itinerary_id
        WHERE i.creator_id = :userId
          AND i.category::text = :category
    """, nativeQuery = true)
    int countParticipantsInCategoryByUser(@Param("userId") Long userId, @Param("category") String category);

    @Query("""
        SELECT COUNT(p)
        FROM Itinerary i
        JOIN i.participants p
        WHERE i.id = :itineraryId
    """)
    int countParticipantsInItinerary(@Param("itineraryId") Long itineraryId);

    @Query("SELECT DISTINCT i.category FROM Itinerary i")
    List<String> findDistinctCategories();

    @Query("""
        SELECT DISTINCT i
        FROM Itinerary i
        JOIN i.participants p
        WHERE p.tourist.id = :userId
    """)
    List<Itinerary> findAllJoinedItineraries(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(os)
        FROM ObjectiveSubmission os
        JOIN os.objective o
        JOIN o.location l
        WHERE os.tourist.id = :userId
          AND os.status = :status
          AND l.itinerary.id = :itineraryId
    """)
    long countApprovedByUserAndItinerary(
            @Param("userId") Long userId,
            @Param("status") SubmissionStatus status,
            @Param("itineraryId") Long itineraryId
    );

    @Query("""
        SELECT i
        FROM Itinerary i
        JOIN i.creator c
        WHERE i.status = :status
        ORDER BY c.travelCoins DESC, i.id DESC
    """)
    List<Itinerary> findByStatusOrderByCreatorTravelCoinsDesc(@Param("status") ItineraryStatus status);

}
