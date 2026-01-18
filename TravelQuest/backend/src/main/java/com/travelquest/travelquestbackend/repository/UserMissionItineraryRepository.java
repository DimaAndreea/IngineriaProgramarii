package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.UserMissionItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMissionItineraryRepository extends JpaRepository<UserMissionItinerary, Long> {

    // Numărul de itinerarii la care userul a participat pentru un UserMission
    int countByUserMissionId(Long userMissionId);

    // Numărul de itinerarii într-o anumită categorie
    @Query("SELECT COUNT(umi) FROM UserMissionItinerary umi " +
            "JOIN umi.itinerary i " +
            "WHERE umi.userMission.id = :userMissionId AND i.category = :category")
    int countByUserMissionIdAndCategory(Long userMissionId, String category);
}
