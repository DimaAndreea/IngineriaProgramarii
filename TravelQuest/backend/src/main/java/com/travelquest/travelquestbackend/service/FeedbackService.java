package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.CreateFeedbackRequest;
import com.travelquest.travelquestbackend.dto.FeedbackDto;
import com.travelquest.travelquestbackend.dto.GuideRatingDto;
import com.travelquest.travelquestbackend.model.Feedback;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryParticipant;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.FeedbackRepository;
import com.travelquest.travelquestbackend.repository.ItineraryParticipantRepository;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * FeedbackService
 * Gestionează crearea, validarea și preluarea feedback-urilor pentru itinerare
 */
@Service
public class FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);

    private final FeedbackRepository feedbackRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryParticipantRepository participantRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                          ItineraryRepository itineraryRepository,
                          UserRepository userRepository,
                          ItineraryParticipantRepository participantRepository) {
        this.feedbackRepository = feedbackRepository;
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
    }

    /**
     * TOURIST creează feedback pentru un itinerariu
     *
     * @param itineraryId ID-ul itinerarului
     * @param tourist user-ul care dă feedback (trebuie să fie turist și participant)
     * @param req CreateFeedbackRequest cu rating și comentariu
     * @return FeedbackDto cu datele feedback-ului salvat
     */
    @Transactional
    public FeedbackDto createFeedback(Long itineraryId, User tourist, CreateFeedbackRequest req) {
        log.info("Creating feedback for itinerary={}, from user={}", itineraryId, tourist.getId());

        // Validări rate
        if (req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Validări dimensiune comentariu
        if (req.getComment() != null && req.getComment().length() > 500) {
            throw new IllegalArgumentException("Comment must be max 500 characters");
        }

        // Găsim itinerariul
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        // Validare: turistul trebuie să fie participant la itinerariu
        boolean isParticipant = participantRepository
                .findAll()
                .stream()
                .anyMatch(p -> p.getItinerary().getId().equals(itineraryId) 
                        && p.getTourist().getId().equals(tourist.getId()));

        if (!isParticipant) {
            throw new IllegalArgumentException("User is not a participant in this itinerary");
        }

        // Validare: turistul NU poate fi ghidul
        if (itinerary.getCreator().getId().equals(tourist.getId())) {
            throw new IllegalArgumentException("Guide cannot give feedback on their own itinerary");
        }

        // Validare: un feedback per turist per itinerariu (unique constraint în DB)
        Optional<Feedback> existing = feedbackRepository
                .findByFromUserIdAndItineraryId(tourist.getId(), itineraryId);

        if (existing.isPresent()) {
            throw new IllegalArgumentException("You have already submitted feedback for this itinerary");
        }

        // Creează și salvează feedback-ul
        Feedback feedback = new Feedback();
        feedback.setFromUser(tourist);
        feedback.setToUser(itinerary.getCreator());  // Ghidul itinerarului
        feedback.setItinerary(itinerary);
        feedback.setRating(req.getRating());
        feedback.setComment(req.getComment());
        feedback.setCreatedAt(ZonedDateTime.now());

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Feedback saved with id={}", saved.getId());

        return mapToDto(saved);
    }

    /**
     * GUIDE vede feedback-urile pentru un itinerariu activ
     * (feedback stage - ce vede ghidul pe pagina itinerarului activ)
     *
     * @param itineraryId ID-ul itinerarului
     * @param guide user-ul care cere (trebuie să fie creator al itinerarului)
     * @return Lista de FeedbackDto pentru participanți
     */
    @Transactional(readOnly = true)
    public List<FeedbackDto> getFeedbackForGuideItinerary(Long itineraryId, User guide) {
        log.info("Getting feedback for itinerary={} from guide={}", itineraryId, guide.getId());

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        // Validare: doar creator itinerarului poate vedea feedback-urile
        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new IllegalArgumentException("Only guide can view itinerary feedback");
        }

        // Returnează toate feedback-urile pentru itinerariu
        return feedbackRepository.findByItineraryId(itineraryId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Publică: calculează media rating-ului + count pentru profilul ghidului
     *
     * @param guideId ID-ul ghidului
     * @return GuideRatingDto cu media și count
     */
    @Transactional(readOnly = true)
    public GuideRatingDto getGuideRating(Long guideId) {
        log.info("Getting rating for guide={}", guideId);

        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new EntityNotFoundException("Guide not found"));

        Optional<Double> avgRating = feedbackRepository.getAverageRatingForGuide(guideId);
        long totalReviews = feedbackRepository.countByToUserId(guideId);

        GuideRatingDto dto = new GuideRatingDto();
        dto.setGuideId(guideId);
        dto.setGuideUsername(guide.getUsername());
        dto.setAverageRating(avgRating.orElse(0.0));
        dto.setTotalReviews(totalReviews);

        return dto;
    }

    /**
     * Publică: obține toate review-urile pentru profilul ghidului
     *
     * @param guideId ID-ul ghidului
     * @return Lista de FeedbackDto cu review-uri
     */
    @Transactional(readOnly = true)
    public List<FeedbackDto> getGuideReviews(Long guideId) {
        log.info("Getting reviews for guide={}", guideId);

        // Validare: ghidul există
        if (!userRepository.existsById(guideId)) {
            throw new EntityNotFoundException("Guide not found");
        }

        return feedbackRepository.findByToUserId(guideId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper: convertă Feedback entity în FeedbackDto
     */
    private FeedbackDto mapToDto(Feedback feedback) {
        FeedbackDto dto = new FeedbackDto();
        dto.setId(feedback.getId());
        
        dto.setFromUserId(feedback.getFromUser().getId());
        dto.setFromUsername(feedback.getFromUser().getUsername());
        // avatar se poate adăuga dacă User model are avatar field
        
        dto.setToUserId(feedback.getToUser().getId());
        dto.setToUsername(feedback.getToUser().getUsername());
        
        dto.setItineraryId(feedback.getItinerary().getId());
        dto.setItineraryTitle(feedback.getItinerary().getTitle());
        
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        
        return dto;
    }
}
