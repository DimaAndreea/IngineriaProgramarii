package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItineraryParticipant;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ItineraryParticipantRepository extends JpaRepository<ItineraryParticipant, Long> {

    // Verifică dacă un turist a participat deja la un itinerariu
    @Query("""
        SELECT CASE WHEN COUNT(ip) > 0 THEN true ELSE false END
        FROM ItineraryParticipant ip
        WHERE ip.itinerary = :itinerary
          AND ip.tourist.id = :touristId
    """)
    boolean existsByItineraryAndTourist(@Param("itinerary") com.travelquest.travelquestbackend.model.Itinerary itinerary,
                                        @Param("touristId") Long touristId);

    // Găsește primul itinerariu activ pentru un turist (toți parametrii necesari)
    @Query("""
        SELECT ip
        FROM ItineraryParticipant ip
        JOIN ip.itinerary i
        WHERE ip.tourist.id = :touristId
          AND i.status = :status
          AND i.startDate <= :today
          AND i.endDate >= :today
    """)
    Optional<ItineraryParticipant> findActiveItineraryForTourist(
            @Param("touristId") Long touristId,
            @Param("status") ItineraryStatus status,
            @Param("today") LocalDate today
    );
}
