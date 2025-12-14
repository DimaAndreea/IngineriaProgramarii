package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItineraryObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryObjectiveRepository extends JpaRepository<ItineraryObjective, Long> 
{
    List<ItineraryObjective> findByLocation_Id(Long locationId);
}
