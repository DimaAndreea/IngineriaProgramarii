package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.GamificationSummaryDto;
import com.travelquest.travelquestbackend.dto.ProfileLevelDto;
import com.travelquest.travelquestbackend.dto.ProfilePointsDto;
import com.travelquest.travelquestbackend.dto.SelectedBadgeDto;
import com.travelquest.travelquestbackend.model.Badge;
import com.travelquest.travelquestbackend.model.LevelThreshold;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.LevelThresholdRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileGamificationService {

    private final UserRepository userRepository;
    private final LevelThresholdRepository levelThresholdRepository;

    public ProfileGamificationService(UserRepository userRepository,
                                      LevelThresholdRepository levelThresholdRepository) {
        this.userRepository = userRepository;
        this.levelThresholdRepository = levelThresholdRepository;
    }

    @Transactional(readOnly = true)
    public ProfilePointsDto getPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return new ProfilePointsDto(user.getXp());
    }

    @Transactional(readOnly = true)
    public ProfileLevelDto getLevelProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        int level = user.getLevel();
        int xp = user.getXp();

        int currentMin = levelThresholdRepository.findByLevel(level)
                .map(LevelThreshold::getMinTotalXp)
                .orElse(0);

        Optional<LevelThreshold> next = levelThresholdRepository
                .findFirstByMinTotalXpGreaterThanOrderByMinTotalXpAsc(xp);

        if (next.isEmpty()) {
            // max level atins (sau nu există praguri mai mari)
            return new ProfileLevelDto(
                    level,
                    xp,
                    currentMin,
                    null,
                    null,
                    null,
                    null
            );
        }

        int nextLevel = next.get().getLevel();
        int nextMin = next.get().getMinTotalXp();
        int xpToNext = Math.max(0, nextMin - xp);

        double progress;
        int denom = Math.max(1, nextMin - currentMin);
        progress = Math.max(0.0, Math.min(1.0, (double) (xp - currentMin) / denom));

        return new ProfileLevelDto(
                level,
                xp,
                currentMin,
                nextLevel,
                nextMin,
                xpToNext,
                progress
        );
    }

    @Transactional(readOnly = true)
    public GamificationSummaryDto getSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ProfileLevelDto levelDto = getLevelProgress(userId);

        SelectedBadgeDto selectedBadge = null;
        Badge b = user.getSelectedBadge();
        if (b != null) {
            selectedBadge = new SelectedBadgeDto(b.getId(), b.getCode(), b.getName());
        }

        return new GamificationSummaryDto(
                user.getLevel(),
                user.getXp(),
                levelDto.getNextLevel(),
                levelDto.getNextLevelMinXp(),
                levelDto.getXpToNextLevel(),
                levelDto.getProgress(),
                selectedBadge
        );
    }
}
