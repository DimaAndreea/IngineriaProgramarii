package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.Badge;
import com.travelquest.travelquestbackend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByRoleAndMinLevelLessThanEqual(UserRole role, int level);
}
