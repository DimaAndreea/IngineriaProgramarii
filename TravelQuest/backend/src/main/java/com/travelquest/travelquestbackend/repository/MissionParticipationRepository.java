package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissionParticipationRepository
        extends JpaRepository<MissionParticipation, Long> {

    Optional<MissionParticipation> findByMissionIdAndUserId(Long missionId, Long userId);

    List<MissionParticipation> findByUserAndStatus(User user, String status);

    boolean existsByMissionAndUser(Mission mission, User user);

}
