package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.CreateFeedbackRequest;
import com.travelquest.travelquestbackend.dto.FeedbackDto;
import com.travelquest.travelquestbackend.dto.GuideRatingDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.FeedbackRepository;
import com.travelquest.travelquestbackend.repository.ItineraryParticipantRepository;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ItineraryRepository itineraryRepository;
    private final ItineraryParticipantRepository itineraryParticipantRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           ItineraryRepository itineraryRepository,
                           ItineraryParticipantRepository itineraryParticipantRepository) {
        this.feedbackRepository = feedbackRepository;
        this.itineraryRepository = itineraryRepository;
        this.itineraryParticipantRepository = itineraryParticipantRepository;
    }

    // =========================
    // TOURIST -> CREATE FEEDBACK
    // =========================
    @Transactional
    public FeedbackDto createFeedback(Long itineraryId, User tourist, CreateFeedbackRequest req) {

        if (tourist == null || tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can submit feedback");
        }

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        String comment = req.getComment();
        if (comment != null && comment.length() > 500) {
            throw new RuntimeException("Comment is too long (max 500)");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (itinerary.getStatus() != ItineraryStatus.APPROVED) {
            throw new RuntimeException("Cannot submit feedback for a non-approved itinerary");
        }

        // must be participant
        boolean joined = itineraryParticipantRepository.existsByItineraryAndTourist(itinerary, tourist.getId());
        if (!joined) {
            throw new RuntimeException("You must join the itinerary before submitting feedback");
        }

        // one feedback per itinerary per tourist (DB has unique too, but we give friendly error)
        if (feedbackRepository.existsByFromUserIdAndItineraryId(tourist.getId(), itineraryId)) {
            throw new RuntimeException("You already submitted feedback for this itinerary");
        }

        User guide = itinerary.getCreator();
        if (guide == null || guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("Invalid guide for this itinerary");
        }

        Feedback f = new Feedback();
        f.setFromUser(tourist);
        f.setToUser(guide);
        f.setItinerary(itinerary);
        f.setRating(req.getRating());
        f.setComment(comment);

        Feedback saved = feedbackRepository.save(f);

        return toDto(saved);
    }

    // =========================
    // GUIDE -> VIEW FEEDBACK FOR ITINERARY
    // =========================
    @Transactional(readOnly = true)
    public List<FeedbackDto> getFeedbackForGuideItinerary(Long itineraryId, User guide) {
        if (guide == null || guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("Only guides can view feedback here");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(guide.getId())) {
            throw new RuntimeException("Forbidden: not your itinerary");
        }

        return feedbackRepository.findByToUserIdAndItineraryIdOrderByCreatedAtDesc(guide.getId(), itineraryId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // =========================
    // GUIDE PROFILE -> rating + reviews
    // =========================
    @Transactional(readOnly = true)
    public GuideRatingDto getGuideRating(Long guideId) {
        Double avg = feedbackRepository.findAverageRatingForGuide(guideId);
        Long count = feedbackRepository.countFeedbacksForGuide(guideId);

        double avgVal = (avg == null) ? 0.0 : avg;
        long countVal = (count == null) ? 0L : count;

        // optional: round to 2 decimals for UI
        avgVal = Math.round(avgVal * 100.0) / 100.0;

        return new GuideRatingDto(avgVal, countVal);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> getGuideReviews(Long guideId) {
        return feedbackRepository.findByToUserIdOrderByCreatedAtDesc(guideId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private FeedbackDto toDto(Feedback f) {
        return new FeedbackDto(
                f.getId(),
                f.getRating(),
                f.getComment(),
                f.getFromUser().getId(),
                f.getFromUser().getUsername(),
                f.getItinerary().getId(),
                f.getItinerary().getTitle(),
                f.getCreatedAt()
        );
    }
}
