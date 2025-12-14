package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItinerarySubmissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class ItinerarySubmissionService {

    private final ItineraryRepository itineraryRepository;
    private final ItinerarySubmissionRepository submissionRepository;

    public ItinerarySubmissionService(
            ItineraryRepository itineraryRepository,
            ItinerarySubmissionRepository submissionRepository
    ) {
        this.itineraryRepository = itineraryRepository;
        this.submissionRepository = submissionRepository;
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

        // Optional: doar creatorul itinerariului poate vedea
        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: not your itinerary");
        }

        return submissionRepository.findByItineraryAndGuide(itinerary, guide);
    }

    // =========================
    // GUIDE VALIDATE
    // =========================
    public ObjectiveSubmission updateSubmissionStatus(Long itineraryId, Long submissionId, User guide, SubmissionStatus newStatus) {

        if (guide == null || guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("You must be logged in as a guide");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        // Optional: doar creatorul itinerariului poate valida
        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: not your itinerary");
        }

        ObjectiveSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));

        // Safety: submission să fie din itinerariul corect
        Long submissionItineraryId = submission.getObjective().getLocation().getItinerary().getId();
        if (!submissionItineraryId.equals(itineraryId)) {
            throw new RuntimeException("Submission does not belong to this itinerary");
        }

        // Safety: ghidul din submission să fie ghidul logat
        if (!submission.getGuide().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: submission not assigned to you");
        }

        if (newStatus != SubmissionStatus.APPROVED && newStatus != SubmissionStatus.REJECTED) {
            throw new RuntimeException("Invalid status");
        }

        submission.setStatus(newStatus);
        submission.setValidatedAt(ZonedDateTime.now());
        return submissionRepository.save(submission);
    }
}
