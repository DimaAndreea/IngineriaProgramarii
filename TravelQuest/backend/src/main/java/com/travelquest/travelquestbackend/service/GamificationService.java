package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.MissionRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GamificationService {

    @Autowired
    private ObjectiveMissionRepository missionRepository;
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private ItineraryRepository itineraryRepository;
    @Autowired
    private ItineraryLocationRepository locationRepository;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- PARTEA DE GHID (Creare Misiuni) ---

    @Transactional
    public ObjectiveMission createMission(Long itineraryId, MissionRequest request) {
        User currentUser = getCurrentUser();
        
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getCreator().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied: Not your itinerary");
        }

        ItineraryLocation location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Validăm că locația aparține acestui itinerariu
        if (!location.getItinerary().getItineraryId().equals(itineraryId)) {
            throw new RuntimeException("Location does not belong to this itinerary");
        }

        ObjectiveMission mission = new ObjectiveMission();
        mission.setDescription(request.getDescription());
        mission.setRewardXp(request.getRewardXp());
        mission.setItinerary(itinerary);
        mission.setLocation(location);

        return missionRepository.save(mission);
    }

    // --- PARTEA DE TURIST (Trimitere Dovadă) ---

    @Transactional
    public Submission createSubmission(Long missionId, String proofUrl) {
        User tourist = getCurrentUser();
        ObjectiveMission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        Submission submission = new Submission();
        submission.setMission(mission);
        submission.setTourist(tourist);
        submission.setGuide(mission.getItinerary().getCreator()); // Trimitem ghidului proprietar
        submission.setSubmissionUrl(proofUrl);
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    // --- PARTEA DE GHID (Validare Dovadă) ---

    @Transactional
    public Submission validateSubmission(Long submissionId, SubmissionStatus newStatus) {
        User guide = getCurrentUser();
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Verificăm dacă userul curent este chiar ghidul responsabil
        if (!submission.getGuide().getUserId().equals(guide.getUserId())) {
            throw new RuntimeException("Access denied: You are not the validator for this mission");
        }

        submission.setStatus(newStatus);
        submission.setValidatedAt(LocalDateTime.now());

        // LOGICA DE RECOMPENSĂ (Dacă e aprobat)
        if (newStatus == SubmissionStatus.APPROVED) {
            User tourist = submission.getTourist();
            int xpReward = submission.getMission().getRewardXp();
            
            // Actualizăm XP-ul turistului
            tourist.setXp(tourist.getXp() + xpReward);
            
            // Logică simplă de Level Up (ex: la fiecare 1000 XP)
            int newLevel = 1 + (tourist.getXp() / 1000);
            tourist.setLevel(newLevel);
            
            // Putem da și Travel Coins (ex: 10% din XP)
            tourist.setTravelCoins(tourist.getTravelCoins() + (xpReward / 10));

            userRepository.save(tourist);
        }

        return submissionRepository.save(submission);
    }

    // Listare submission-uri în așteptare pentru ghid
    public List<Submission> getPendingSubmissions() {
        User guide = getCurrentUser();
        return submissionRepository.findByGuideAndStatus(guide, SubmissionStatus.PENDING);
    }
}