package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItineraryLocationRepository extends JpaRepository<ItineraryLocation, Long> {
    List<ItineraryLocation> findByItineraryOrderByOrderIndexAsc(Itinerary itinerary);
}