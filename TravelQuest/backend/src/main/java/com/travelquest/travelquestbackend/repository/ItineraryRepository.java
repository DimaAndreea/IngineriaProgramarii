package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    List<Itinerary> findByCreatorId(Long creatorId);

    List<Itinerary> findByStatus(ItineraryStatus status);
}
