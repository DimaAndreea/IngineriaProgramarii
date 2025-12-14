package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItinerarySubmissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    /**
     * Turistul trimite o submisie (poza) pentru un obiectiv din itinerariu activ.
     */
    public ObjectiveSubmission submitPhoto(Long itineraryId, Long objectiveId, User tourist, MultipartFile file) {
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

        // 4️⃣ Găsim obiectivul specificat
        ItineraryObjective objective = itinerary.getLocations().stream()
                .flatMap(location -> location.getObjectives().stream())
                .filter(obj -> obj.getId().equals(objectiveId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Objective not found in this itinerary"));

        // 5️⃣ Verificăm dacă turistul a mai trimis o submisie pentru acest obiectiv
        if (submissionRepository.existsByTouristAndObjective(tourist, objective)) {
            throw new RuntimeException("You have already submitted a photo for this objective");
        }

        // 6️⃣ Creăm și salvăm submisia
        try {
            ObjectiveSubmission submission = new ObjectiveSubmission();
            submission.setObjective(objective);
            submission.setTourist(tourist);
            submission.setGuide(itinerary.getCreator());
            submission.setSubmissionUrl(storeFileAndGetUrl(file));
            submission.setSubmittedAt(ZonedDateTime.now());
            submission.setStatus(SubmissionStatus.PENDING);

            return submissionRepository.save(submission);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    /**
     * Exemplu simplu de metodă care primește fișierul și returnează un URL.
     * Poți să stochezi în local, S3 sau altă soluție.
     */
    private String storeFileAndGetUrl(MultipartFile file) {
        // TODO: adaugă logica de stocare reală
        return "/uploads/" + file.getOriginalFilename();
    }

    /**
     * Returnează toate submisiile turistului pentru un itinerariu.
     */
    public List<ObjectiveSubmission> getSubmissionsForTourist(Long itineraryId, User tourist) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        return submissionRepository.findByItineraryAndTourist(itinerary, tourist);
    }
}
