package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface MissionParticipationRepository extends JpaRepository<MissionParticipation, Long> {
    boolean existsByMissionAndUser(Mission mission, User user);
}
