package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import com.travelquest.travelquestbackend.model.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ObjectiveSubmissionRepository
        extends JpaRepository<ObjectiveSubmission, Long> {

    // =====================================================
    // TOURIST MISSIONS
    // =====================================================

    /**
     * Număr de submissions APPROVED făcute de un turist
     */
    @Query("""
        SELECT COUNT(os)
        FROM ObjectiveSubmission os
        WHERE os.tourist.id = :userId
          AND os.status = :status
    """)
    long countByTouristAndStatus(
            @Param("userId") Long userId,
            @Param("status") SubmissionStatus status
    );

    /**
     * Număr de submissions APPROVED făcute de un turist,
     * filtrate după categoria obiectivului
     */
//    @Query("""
//        SELECT COUNT(os)
//        FROM ObjectiveSubmission os
//        WHERE os.tourist.id = :userId
//          AND os.status = :status
//          AND os.objective.category = :category
//    """)
//    long countByTouristAndStatusAndCategory(
//            @Param("userId") Long userId,
//            @Param("status") SubmissionStatus status,
//            @Param("category") String category
//    );

    // =====================================================
    // GUIDE MISSIONS
    // =====================================================

    /**
     * Număr de submissions evaluate (validate) de un ghid
     */
    @Query("""
        SELECT COUNT(os)
        FROM ObjectiveSubmission os
        WHERE os.guide.id = :guideId
          AND os.status <> com.travelquest.travelquestbackend.model.SubmissionStatus.PENDING
    """)
    long countEvaluatedByGuide(@Param("guideId") Long guideId);

    // Numărul de submissions aprobate într-un anumit itinerariu
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.id = :userId AND s.status = 'APPROVED' AND s.itineraryId = :itineraryId")
    long countByTouristAndStatusAndItinerary(@Param("userId") Long userId, @Param("status") SubmissionStatus status, @Param("itineraryId") Long itineraryId);

}
