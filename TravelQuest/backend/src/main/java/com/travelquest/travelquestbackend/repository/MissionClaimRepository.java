package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.MissionClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MissionClaimRepository extends JpaRepository<MissionClaim, Long> {

    Optional<MissionClaim> findByUserIdAndMissionId(Long userId, Long missionId);

    boolean existsByUserIdAndMissionId(Long userId, Long missionId);
}
