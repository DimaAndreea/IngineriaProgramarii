package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    List<UserBadge> findByUserId(Long userId);
}
