package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Submission;
import com.travelquest.travelquestbackend.model.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Numărul de submissions aprobate pentru un utilizator
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED'")
    long countByTouristAndStatus(@Param("userId") Long userId, @Param("status") SubmissionStatus status);

    // Numărul de submissions aprobate într-o categorie
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED' AND s.category = :category")
    long countByTouristAndStatusAndCategory(@Param("userId") Long userId, @Param("status") SubmissionStatus status, @Param("category") String category);

    // Numărul de submissions evaluate de un evaluator (GUIDE)
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.evaluator.id = :userId")
    long countEvaluatedByGuide(@Param("userId") Long userId);
}
