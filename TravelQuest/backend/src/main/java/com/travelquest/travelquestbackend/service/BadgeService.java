package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.Badge;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserBadge;
import com.travelquest.travelquestbackend.repository.BadgeRepository;
import com.travelquest.travelquestbackend.repository.UserBadgeRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    public BadgeService(BadgeRepository badgeRepository,
                        UserBadgeRepository userBadgeRepository,
                        UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void unlockBadgesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Badge> eligibleBadges =
                badgeRepository.findByRoleAndMinLevelLessThanEqual(user.getRole(), user.getLevel());

        for (Badge badge : eligibleBadges) {
            boolean alreadyUnlocked =
                    userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId());

            if (!alreadyUnlocked) {
                UserBadge userBadge = new UserBadge();
                userBadge.setUser(user);
                userBadge.setBadge(badge);
                userBadge.setAwardedAt(ZonedDateTime.now());
                userBadgeRepository.save(userBadge);
            }
        }
    }
}
