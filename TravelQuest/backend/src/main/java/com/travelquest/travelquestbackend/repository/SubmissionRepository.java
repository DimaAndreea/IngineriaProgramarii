package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Numărul de submissions aprobate pentru un utilizator
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED'")
    int countApprovedByUser(Long userId);

    // Numărul de submissions aprobate într-o categorie
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED' AND s.category = :category")
    int countApprovedByUserAndCategory(Long userId, String category);

    // Numărul de submissions aprobate într-un anumit itinerariu
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED' AND s.itineraryId = :itineraryId")
    int countApprovedByUserAndItinerary(Long userId, Long itineraryId);

    // Numărul de submissions evaluate de un evaluator
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.evaluator.id = :userId")
    int countEvaluatedByUser(Long userId);
}
