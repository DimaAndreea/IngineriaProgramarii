package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByCreatorId(Long creatorId);

    List<Itinerary> findByStatus(ItineraryStatus status);

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

    @Query("""
        SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END
        FROM Itinerary i
        WHERE i.creator.id = :creatorId
          AND i.status <> com.travelquest.travelquestbackend.model.ItineraryStatus.REJECTED
          AND i.startDate <= :newEndDate
          AND i.endDate   >= :newStartDate
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
          AND i.endDate   >= :newStartDate
    """)
    boolean existsOverlappingItineraryForGuideExcludingItinerary(
            @Param("creatorId") Long creatorId,
            @Param("itineraryId") Long itineraryId,
            @Param("newStartDate") LocalDate newStartDate,
            @Param("newEndDate") LocalDate newEndDate
    );

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

}