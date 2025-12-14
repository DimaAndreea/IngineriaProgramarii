package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItinerarySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItinerarySubmissionRepository extends JpaRepository<ItinerarySubmission, Long> {

    List<ItinerarySubmission> findByObjective_IdIn(List<Long> objectiveIds);

    Optional<ItinerarySubmission> findByTourist_IdAndObjective_Id(Long touristId, Long objectiveId);

    List<ItinerarySubmission> findByItinerary_IdAndTourist_Id(Long itineraryId, Long touristId);

}
