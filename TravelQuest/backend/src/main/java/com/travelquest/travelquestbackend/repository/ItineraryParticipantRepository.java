package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryParticipant;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItineraryParticipantRepository extends JpaRepository<ItineraryParticipant, Long> {

    /// Verifică dacă un turist a participat deja la un itinerariu
    boolean existsByItineraryAndTourist(Itinerary itinerary, User tourist);
}
