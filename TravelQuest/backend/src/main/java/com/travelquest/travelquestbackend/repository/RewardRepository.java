package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {

    Optional<Reward> findByMissionId(Long missionId);
}
