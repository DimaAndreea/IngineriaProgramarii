package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Submission;
import com.travelquest.travelquestbackend.model.SubmissionStatus;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // Pentru Ghid: să vadă ce are de corectat
    List<Submission> findByGuideAndStatus(User guide, SubmissionStatus status);
    
    // Pentru Turist: să își vadă istoricul
    List<Submission> findByTourist(User tourist);
}