package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.GamifiedActionType;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserPointsHistory;
import com.travelquest.travelquestbackend.repository.UserPointsHistoryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PointsService {

    private final UserRepository userRepository;
    private final UserPointsHistoryRepository userPointsHistoryRepository;
    private final LevelService levelService;

    public PointsService(UserRepository userRepository,
                         UserPointsHistoryRepository userPointsHistoryRepository,
                         LevelService levelService) {
        this.userRepository = userRepository;
        this.userPointsHistoryRepository = userPointsHistoryRepository;
        this.levelService = levelService;
    }

    /**
     * Adaugă puncte (XP) unui user, salvează în users, scrie istoric și recalculează nivelul.
     * Este extensibil: actionType + metadata (itineraryId/objectiveId/submissionId).
     */
    @Transactional
    public int addPoints(Long userId,
                         int pointsDelta,
                         GamifiedActionType actionType,
                         Long itineraryId,
                         Long objectiveId,
                         Long submissionId) {

        if (pointsDelta == 0) {
            // nu facem nimic, dar returnăm nivelul curent
            User u = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            return u.getLevel();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Defensive: nu permitem XP negativ (poți schimba regula dacă vrei)
        if (pointsDelta < 0) {
            throw new RuntimeException("Negative pointsDelta is not allowed");
        }

        // 1) update XP
        user.setXp(user.getXp() + pointsDelta);
        userRepository.save(user);

        // 2) write points history
        UserPointsHistory h = new UserPointsHistory();
        h.setUser(user);
        h.setActionType(actionType);
        h.setPointsDelta(pointsDelta);
        h.setItineraryId(itineraryId);
        h.setObjectiveId(objectiveId);
        h.setSubmissionId(submissionId);
        userPointsHistoryRepository.save(h);

        // 3) recalc level
        return levelService.recalculateLevel(userId);
    }

    // Overload-uri “confort” (fără metadata)
    @Transactional
    public int addPoints(Long userId, int pointsDelta, GamifiedActionType actionType) {
        return addPoints(userId, pointsDelta, actionType, null, null, null);
    }

    @Transactional
    public int addPointsForObjectiveApproved(Long touristId, int xpReward, Long itineraryId, Long objectiveId, Long submissionId) {
        return addPoints(touristId, xpReward, GamifiedActionType.OBJECTIVE_APPROVED, itineraryId, objectiveId, submissionId);
    }

    @Transactional
    public int addPointsForItineraryJoinedGuide(Long guideId, Long itineraryId) {
        return addPoints(guideId, 25, GamifiedActionType.ITINERARY_JOINED, itineraryId, null, null);
    }

    @Transactional
    public int addPointsForSubmissionValidatedGuide(Long guideId, Long itineraryId, Long submissionId) {
        return addPoints(guideId, 5, GamifiedActionType.SUBMISSION_VALIDATED, itineraryId, null, submissionId);
    }
}
