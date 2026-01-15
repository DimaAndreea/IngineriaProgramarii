package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.UserPointsHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPointsHistoryRepository extends JpaRepository<UserPointsHistory, Long> {
}
