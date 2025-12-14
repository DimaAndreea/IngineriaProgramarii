package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryObjective;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItinerarySubmissionRepository extends JpaRepository<ObjectiveSubmission, Long> {

    // Obține toate submisiile unui turist pentru un anumit itinerariu
    @Query("""
        SELECT os
        FROM ObjectiveSubmission os
        WHERE os.tourist = :tourist
          AND os.objective.location.itinerary = :itinerary
    """)
    List<ObjectiveSubmission> findByItineraryAndTourist(
            @Param("itinerary") Itinerary itinerary,
            @Param("tourist") User tourist
    );

    // ✅ Obține toate submisiile pentru un ghid (istoric inclus) pentru un itinerariu
    @Query("""
        SELECT os
        FROM ObjectiveSubmission os
        WHERE os.guide = :guide
          AND os.objective.location.itinerary = :itinerary
        ORDER BY os.submittedAt DESC
    """)
    List<ObjectiveSubmission> findByItineraryAndGuide(
            @Param("itinerary") Itinerary itinerary,
            @Param("guide") User guide
    );

    // Verifică dacă există deja o submisie pentru un turist și un obiectiv specific
    boolean existsByTouristAndObjective(User tourist, ItineraryObjective objective);
}
