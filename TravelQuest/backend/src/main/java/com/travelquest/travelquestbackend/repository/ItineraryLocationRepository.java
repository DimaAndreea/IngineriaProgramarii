package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItineraryLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItineraryLocationRepository extends JpaRepository<ItineraryLocation, Long> {
}
