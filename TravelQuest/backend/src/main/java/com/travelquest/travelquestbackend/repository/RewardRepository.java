package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Reward;
import com.travelquest.travelquestbackend.dto.RewardDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {

    @Query("SELECT new com.travelquest.travelquestbackend.dto.RewardDto(r.id, r.title, mp.claimedAt, m.title) " +
            "FROM Reward r " +
            "JOIN r.mission m " +
            "JOIN MissionParticipation mp ON mp.mission = m " +
            "WHERE mp.user.id = :userId AND mp.status = 'CLAIMED'")
    List<RewardDto> findClaimedRewardsByUserId(@Param("userId") Long userId);
}
