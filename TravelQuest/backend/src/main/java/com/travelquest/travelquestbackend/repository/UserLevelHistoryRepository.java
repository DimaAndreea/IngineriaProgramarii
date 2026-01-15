package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.UserLevelHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLevelHistoryRepository extends JpaRepository<UserLevelHistory, Long> {
}
