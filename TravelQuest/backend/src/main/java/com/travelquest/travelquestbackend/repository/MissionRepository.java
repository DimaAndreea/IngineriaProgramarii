package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MissionRepository extends JpaRepository<Mission, Long> {
}
