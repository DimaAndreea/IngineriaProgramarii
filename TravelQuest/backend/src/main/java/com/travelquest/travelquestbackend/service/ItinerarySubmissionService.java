package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class ItinerarySubmissionService {

    private final ItineraryRepository itineraryRepository;
    private final ItineraryParticipantRepository participantRepository;
    private final ItinerarySubmissionRepository submissionRepository;

    public ItinerarySubmissionService(
            ItineraryRepository itineraryRepository,
            ItineraryParticipantRepository participantRepository,
            ItinerarySubmissionRepository submissionRepository
    ) {
        this.itineraryRepository = itineraryRepository;
        this.participantRepository = participantRepository;
        this.submissionRepository = submissionRepository;
    }

    public ItinerarySubmission submitPhoto(Long itineraryId, User tourist, MultipartFile file) {
        // 1️⃣ Verificăm existența itinerariului
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        // 2️⃣ Verificăm rolul utilizatorului
        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can submit photos");
        }

        // 3️⃣ Verificăm că itinerariul este activ
        LocalDate today = LocalDate.now();
        if (itinerary.getStatus() != ItineraryStatus.APPROVED ||
                itinerary.getStartDate().isAfter(today) ||
                itinerary.getEndDate().isBefore(today)) {
            throw new RuntimeException("Submission allowed only for active itineraries");
        }

        // 4️⃣ Creăm și salvăm submission-ul
        try {
            ItinerarySubmission submission = new ItinerarySubmission();
            submission.setItinerary(itinerary);
            submission.setTourist(tourist);
            submission.setImageData(file.getBytes());
            submission.setFileName(file.getOriginalFilename());
            submission.setContentType(file.getContentType());
            submission.setSubmittedAt(ZonedDateTime.now());
            submission.setStatus(ItinerarySubmission.SubmissionStatus.PENDING);

            return submissionRepository.save(submission);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage());
        }
    }

    public List<ItinerarySubmission> getSubmissionsForTourist(Long itineraryId, User tourist) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        return submissionRepository.findByItineraryAndTourist(itinerary, tourist);
    }
}
