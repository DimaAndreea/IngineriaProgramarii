package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    boolean existsByFromUserIdAndItineraryId(Long fromUserId, Long itineraryId);

    List<Feedback> findByToUserIdAndItineraryIdOrderByCreatedAtDesc(Long toUserId, Long itineraryId);

    List<Feedback> findByToUserIdOrderByCreatedAtDesc(Long toUserId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.toUser.id = :guideId")
    Double findAverageRatingForGuide(Long guideId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.toUser.id = :guideId")
    Long countFeedbacksForGuide(Long guideId);
}
