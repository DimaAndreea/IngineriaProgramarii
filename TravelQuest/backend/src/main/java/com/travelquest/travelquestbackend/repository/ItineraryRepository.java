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
}
