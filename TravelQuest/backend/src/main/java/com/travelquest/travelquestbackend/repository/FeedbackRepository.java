package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    /**
     * Găsește feedback-ul dat de un user pentru un itinerariu specific
     * (validează constrângerea unică)
     */
    @Query("SELECT f FROM Feedback f WHERE f.fromUser.id = :fromUserId AND f.itinerary.id = :itineraryId")
    Optional<Feedback> findByFromUserIdAndItineraryId(@Param("fromUserId") Long fromUserId, @Param("itineraryId") Long itineraryId);
    
    /**
     * Găsește toate feedback-urile pentru un itinerariu specific
     * (ce vede ghidul la feedback stage)
     */
    List<Feedback> findByItineraryId(Long itineraryId);
    
    /**
     * Găsește toate feedback-urile primite de un ghid
     * (pentru profilul ghidului)
     */
    @Query("SELECT f FROM Feedback f WHERE f.toUser.id = :toUserId")
    List<Feedback> findByToUserId(@Param("toUserId") Long toUserId);
    
    /**
     * Calculează media rating-urilor pentru un ghid
     */
    @Query("SELECT AVG(CAST(f.rating AS double)) FROM Feedback f WHERE f.toUser.id = :guideId")
    Optional<Double> getAverageRatingForGuide(@Param("guideId") Long guideId);
    
    /**
     * Contează feedback-urile pentru un ghid
     */
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.toUser.id = :toUserId")
    long countByToUserId(@Param("toUserId") Long toUserId);
}
