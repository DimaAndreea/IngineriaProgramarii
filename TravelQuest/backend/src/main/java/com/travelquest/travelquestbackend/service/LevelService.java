package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.LevelThreshold;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserLevelHistory;
import com.travelquest.travelquestbackend.repository.LevelThresholdRepository;
import com.travelquest.travelquestbackend.repository.UserLevelHistoryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LevelService {

    private final LevelThresholdRepository levelThresholdRepository;
    private final UserRepository userRepository;
    private final UserLevelHistoryRepository userLevelHistoryRepository;

    public LevelService(LevelThresholdRepository levelThresholdRepository,
                        UserRepository userRepository,
                        UserLevelHistoryRepository userLevelHistoryRepository) {
        this.levelThresholdRepository = levelThresholdRepository;
        this.userRepository = userRepository;
        this.userLevelHistoryRepository = userLevelHistoryRepository;
    }

    /**
     * Recalculează nivelul corect pe baza XP total, citind pragurile din tabela levels.
     * Dacă nivelul se schimbă, actualizează users.level și scrie în user_level_history.
     */
    @Transactional
    public int recalculateLevel(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        int oldLevel = user.getLevel();
        int xp = user.getXp();

        int computed = computeLevelFromXp(xp);

        if (computed != oldLevel) {
            user.setLevel(computed);
            userRepository.save(user);

            UserLevelHistory h = new UserLevelHistory();
            h.setUser(user);
            h.setOldLevel(oldLevel);
            h.setNewLevel(computed);
            h.setReason("XP_UPDATE");
            userLevelHistoryRepository.save(h);
        }

        return computed;
    }

    /**
     * Determină nivelul maxim pentru care min_total_xp <= xp.
     */
    int computeLevelFromXp(int xp) {
        List<LevelThreshold> thresholds = levelThresholdRepository.findAllByOrderByMinTotalXpAsc();
        if (thresholds.isEmpty()) {
            return 1; // fallback
        }

        int level = 1;
        for (LevelThreshold t : thresholds) {
            if (xp >= t.getMinTotalXp()) {
                level = t.getLevel();
            } else {
                break;
            }
        }
        return level;
    }
}
