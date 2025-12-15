package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MyBadgeDto;
import com.travelquest.travelquestbackend.dto.SelectedBadgeDto;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeProfileService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    public BadgeProfileService(BadgeRepository badgeRepository,
                              UserBadgeRepository userBadgeRepository,
                              UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lista pentru "My Badges" (doar badge-uri ale rolului userului).
     * Nu deblochează automat badge-uri aici; doar afișează starea curentă.
     */
    @Transactional(readOnly = true)
    public List<MyBadgeDto> getMyBadges(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Badge> allForRole = badgeRepository.findByRoleOrderByMinLevelAsc(user.getRole());
        List<UserBadge> unlocked = userBadgeRepository.findByUserId(userId);

        Map<Long, ZonedDateTime> awardedAtByBadgeId = unlocked.stream()
                .collect(Collectors.toMap(
                        ub -> ub.getBadge().getId(),
                        UserBadge::getAwardedAt,
                        (a, b) -> a
                ));

        Long selectedId = user.getSelectedBadge() != null ? user.getSelectedBadge().getId() : null;

        List<MyBadgeDto> result = new ArrayList<>();
        for (Badge b : allForRole) {
            boolean isUnlocked = awardedAtByBadgeId.containsKey(b.getId());
            boolean isSelected = selectedId != null && selectedId.equals(b.getId());
            ZonedDateTime awardedAt = awardedAtByBadgeId.get(b.getId());

            result.add(new MyBadgeDto(
                    b.getId(),
                    b.getCode(),
                    b.getName(),
                    b.getDescription(),
                    b.getMinLevel(),
                    b.getRole(),
                    isUnlocked,
                    isSelected,
                    awardedAt
            ));
        }
        return result;
    }

    /**
     * Selectează un badge pentru afișare publică.
     * Permitem selectarea doar dacă badge-ul este deblocat (există în user_badge).
     */
    @Transactional
    public SelectedBadgeDto selectBadge(Long userId, Long badgeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new EntityNotFoundException("Badge not found"));

        // Safety: badge-ul trebuie să fie pentru rolul userului
        if (badge.getRole() != user.getRole()) {
            throw new RuntimeException("Cannot select a badge for a different role");
        }

        // Safety: trebuie să fie deblocat
        boolean unlocked = userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId);
        if (!unlocked) {
            throw new RuntimeException("Cannot select a badge that is not unlocked");
        }

        user.setSelectedBadge(badge);
        userRepository.save(user);

        return new SelectedBadgeDto(badge.getId(), badge.getCode(), badge.getName());
    }

    /**
     * Scoate badge-ul selectat (user nu mai afișează nimic public).
     */
    @Transactional
    public void clearSelectedBadge(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setSelectedBadge(null);
        userRepository.save(user);
    }

    /**
     * Pentru profil: returnează badge-ul selectat (sau null).
     */
    @Transactional(readOnly = true)
    public SelectedBadgeDto getSelectedBadge(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getSelectedBadge() == null) return null;

        Badge b = user.getSelectedBadge();
        return new SelectedBadgeDto(b.getId(), b.getCode(), b.getName());
    }
}
