package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItinerarySubmission;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItinerarySubmissionRepository extends JpaRepository<ItinerarySubmission, Long> {

    List<ItinerarySubmission> findByItineraryAndTourist(Itinerary itinerary, User tourist);

}
