package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.MissionParticipation;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.MissionParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissionParticipationRepository extends JpaRepository<MissionParticipation, Long> {

    // =========================
    // FIND PARTICIPATION
    // =========================
    Optional<MissionParticipation> findByMissionAndUser(Mission mission, User user);

    Optional<MissionParticipation> findByMission_IdAndUser_Id(Long missionId, Long userId);


    List<MissionParticipation> findByUser_Id(Long userId);
    List<MissionParticipation> findByStatusIn(List<MissionParticipationStatus> statuses);

    boolean existsByMissionAndUser(Mission mission, User user);

    // =========================
    // REWARDS / MY MISSIONS
    // =========================
    List<MissionParticipation> findByUserAndStatus(User user, MissionParticipationStatus status);

    List<MissionParticipation> findByUserAndStatusIn(
            User user,
            List<MissionParticipationStatus> statuses
    );
}
