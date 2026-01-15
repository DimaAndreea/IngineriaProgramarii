package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItinerarySubmissionRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class ItinerarySubmissionService {

    private static final int GUIDE_XP_PER_VALIDATION = 5;

    private final ItineraryRepository itineraryRepository;
    private final ItinerarySubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public ItinerarySubmissionService(
            ItineraryRepository itineraryRepository,
            ItinerarySubmissionRepository submissionRepository,
            UserRepository userRepository,
            PointsService pointsService
    ) {
        this.itineraryRepository = itineraryRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    // =========================
    // TOURIST SUBMIT (BASE64)
    // =========================
    public ObjectiveSubmission submitPhoto(Long itineraryId, Long objectiveId, User tourist, String submissionBase64) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can submit photos");
        }

        LocalDate today = LocalDate.now();
        if (itinerary.getStatus() != ItineraryStatus.APPROVED ||
                itinerary.getStartDate().isAfter(today) ||
                itinerary.getEndDate().isBefore(today)) {
            throw new RuntimeException("Submission allowed only for active itineraries");
        }

        ItineraryObjective objective = itinerary.getLocations().stream()
                .flatMap(location -> location.getObjectives().stream())
                .filter(obj -> obj.getId().equals(objectiveId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Objective not found in this itinerary"));

        if (submissionRepository.existsByTouristAndObjective(tourist, objective)) {
            throw new RuntimeException("You have already submitted a photo for this objective");
        }

        if (submissionBase64 == null || submissionBase64.isBlank()) {
            throw new RuntimeException("Submission image is required");
        }
        if (!submissionBase64.startsWith("data:image/")) {
            throw new RuntimeException("Invalid image format (expected data:image/* base64)");
        }

        ObjectiveSubmission submission = new ObjectiveSubmission();
        submission.setObjective(objective);
        submission.setTourist(tourist);
        submission.setGuide(itinerary.getCreator());
        submission.setSubmissionBase64(submissionBase64);
        submission.setSubmittedAt(ZonedDateTime.now());
        submission.setStatus(SubmissionStatus.PENDING);

        // XP turist se acordă doar la APPROVED
        submission.setXpGranted(false);

        return submissionRepository.save(submission);
    }

    public List<ObjectiveSubmission> getSubmissionsForTourist(Long itineraryId, User tourist) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        return submissionRepository.findByItineraryAndTourist(itinerary, tourist);
    }

    // =========================
    // GUIDE VIEW (HISTORY)
    // =========================
    public List<ObjectiveSubmission> getSubmissionsForGuide(Long itineraryId, User guide) {
        if (guide == null || guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("You must be logged in as a guide");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: not your itinerary");
        }

        return submissionRepository.findByItineraryAndGuide(itinerary, guide);
    }

    // =========================
    // GUIDE VALIDATE
    // =========================
    @Transactional
    public ObjectiveSubmission updateSubmissionStatus(Long itineraryId, Long submissionId, User guide, SubmissionStatus newStatus) {

        if (guide == null || guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("You must be logged in as a guide");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: not your itinerary");
        }

        ObjectiveSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));

        Long submissionItineraryId = submission.getObjective().getLocation().getItinerary().getId();
        if (!submissionItineraryId.equals(itineraryId)) {
            throw new RuntimeException("Submission does not belong to this itinerary");
        }

        if (!submission.getGuide().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: submission not assigned to you");
        }

        if (newStatus != SubmissionStatus.APPROVED && newStatus != SubmissionStatus.REJECTED) {
            throw new RuntimeException("Invalid status");
        }

        // ✅ dăm +5 XP ghidului doar la prima validare (PENDING -> APPROVED/REJECTED)
        boolean isFirstValidation = (submission.getStatus() == SubmissionStatus.PENDING)
                && (newStatus == SubmissionStatus.APPROVED || newStatus == SubmissionStatus.REJECTED);

        // Idempotent: dacă e deja statusul cerut, nu facem update inutil
        if (submission.getStatus() == newStatus) {
            return submission;
        }

        submission.setStatus(newStatus);
        submission.setValidatedAt(ZonedDateTime.now());

        Long itId = submission.getObjective().getLocation().getItinerary().getId();

        // =========================
        // TOURIST XP (DOAR LA APPROVED) + HISTORY + LEVEL RECALC
        // =========================
        if (newStatus == SubmissionStatus.APPROVED && !submission.isXpGranted()) {
            int xpReward = submission.getObjective().getXpReward();
            if (xpReward > 0) {
                pointsService.addPointsForObjectiveApproved(
                        submission.getTourist().getId(),
                        xpReward,
                        itId,
                        submission.getObjective().getId(),
                        submission.getId()
                );
            }
            submission.setXpGranted(true);
        }

        // =========================
        // GUIDE XP (LA ORICE VALIDARE) + HISTORY + LEVEL RECALC
        // =========================
        if (isFirstValidation) {
            // folosim PointsService ca să fie consistent (history + recalc level)
            pointsService.addPointsForSubmissionValidatedGuide(
                    submission.getGuide().getId(),
                    itId,
                    submission.getId()
            );
        }

        return submissionRepository.save(submission);
    }
}
