package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ObjectiveMission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObjectiveMissionRepository extends JpaRepository<ObjectiveMission, Long> {
    List<ObjectiveMission> findByItinerary(Itinerary itinerary);
}