package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
