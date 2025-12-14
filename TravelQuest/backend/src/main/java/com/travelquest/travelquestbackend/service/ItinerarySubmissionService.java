package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryObjectiveRepository;
import com.travelquest.travelquestbackend.repository.ItineraryParticipantRepository;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItinerarySubmissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ItinerarySubmissionService {

    private final ItineraryRepository itineraryRepository;
    private final ItineraryParticipantRepository participantRepository;
    private final ItinerarySubmissionRepository submissionRepository;
    private final ItineraryObjectiveRepository itineraryObjectiveRepository;

    public ItinerarySubmissionService(
            ItineraryRepository itineraryRepository,
            ItineraryParticipantRepository participantRepository,
            ItinerarySubmissionRepository submissionRepository,
            ItineraryObjectiveRepository itineraryObjectiveRepository
    ) {
        this.itineraryRepository = itineraryRepository;
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
        this.itineraryObjectiveRepository = itineraryObjectiveRepository;
    }

    /**
     * Tourist submits (or replaces) a photo for a specific objective in an active itinerary.
     * One submission per (tourist, objective).
     */
    public ItinerarySubmission submitPhoto(Long itineraryId, Long objectiveId, User tourist, MultipartFile file) {

        // 1) Itinerary exists
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        // 2) Role check
        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can submit photos");
        }

        // 3) Itinerary must be active + approved
        LocalDate today = LocalDate.now();
        if (itinerary.getStatus() != ItineraryStatus.APPROVED
                || itinerary.getStartDate().isAfter(today)
                || itinerary.getEndDate().isBefore(today)) {
            throw new RuntimeException("Submission allowed only for active itineraries");
        }

        // 4) Tourist must be a participant
        boolean isParticipant = participantRepository.findByItinerary_Id(itineraryId).stream()
                .anyMatch(p -> p.getTourist().getId().equals(tourist.getId()));

        if (!isParticipant) {
            throw new RuntimeException("You are not a participant of this itinerary");
        }

        // 5) Objective must exist and belong to this itinerary
        ItineraryObjective objective = itineraryObjectiveRepository.findById(objectiveId)
                .orElseThrow(() -> new RuntimeException("Objective not found"));

        Long objectiveItineraryId = objective.getLocation().getItinerary().getId();
        if (!objectiveItineraryId.equals(itineraryId)) {
            throw new RuntimeException("Objective does not belong to this itinerary");
        }

        // 6) Create or update submission (unique per tourist + objective)
        try {
            ItinerarySubmission submission = submissionRepository
                    .findByTourist_IdAndObjective_Id(tourist.getId(), objectiveId)
                    .orElseGet(ItinerarySubmission::new);

            submission.setItinerary(itinerary);
            submission.setObjective(objective);
            submission.setTourist(tourist);

            // guide is the itinerary creator
            submission.setGuide(itinerary.getCreator());

            submission.setImageData(file.getBytes());
            submission.setFileName(file.getOriginalFilename());
            submission.setContentType(file.getContentType());
            submission.setSubmittedAt(ZonedDateTime.now());

            // reset status for a new/updated upload
            submission.setStatus(SubmissionStatus.PENDING);

            return submissionRepository.save(submission);

        } catch (Exception e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage());
        }
    }

    /**
     * Returns all submissions of a tourist for objectives that belong to the itinerary.
     * Useful for tourist-side "my submissions" view.
     */
    public List<ItinerarySubmission> getSubmissionsForTourist(Long itineraryId, User tourist) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can view their submissions");
        }

        // Optional: ensure tourist is participant
        boolean isParticipant = participantRepository.findByItinerary_Id(itineraryId).stream()
                .anyMatch(p -> p.getTourist().getId().equals(tourist.getId()));
        if (!isParticipant) {
            throw new RuntimeException("You are not a participant of this itinerary");
        }

        // Get all objective IDs for this itinerary (using entity graph via itinerary -> locations -> objectives).
        // If your locations/objectives are LAZY and you run into LazyInitialization issues,
        // we can switch this to repository join queries.
        List<Long> objectiveIds = new ArrayList<>();
        if (itinerary.getLocations() != null) {
            itinerary.getLocations().forEach(loc -> {
                if (loc.getObjectives() != null) {
                    loc.getObjectives().forEach(obj -> objectiveIds.add(obj.getId()));
                }
            });
        }

        if (objectiveIds.isEmpty()) {
            return List.of();
        }

        // Fetch all submissions for those objectives and filter by this tourist
        return submissionRepository.findByObjective_IdIn(objectiveIds).stream()
                .filter(s -> s.getTourist().getId().equals(tourist.getId()))
                .toList();
    }
}