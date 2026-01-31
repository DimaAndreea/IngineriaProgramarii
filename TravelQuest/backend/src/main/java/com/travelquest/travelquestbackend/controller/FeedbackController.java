package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.CreateFeedbackRequest;
import com.travelquest.travelquestbackend.dto.FeedbackDto;
import com.travelquest.travelquestbackend.dto.GuideRatingDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // TOURIST submits feedback for an itinerary's guide
    @PostMapping("/itineraries/{itineraryId}/feedback")
    public ResponseEntity<FeedbackDto> createFeedback(@PathVariable Long itineraryId,
                                                      @SessionAttribute("user") User user,
                                                      @RequestBody CreateFeedbackRequest req) {
        return ResponseEntity.ok(feedbackService.createFeedback(itineraryId, user, req));
    }

    // GUIDE views feedback for a specific itinerary (active itinerary page)
    @GetMapping("/guide/itineraries/{itineraryId}/feedback")
    public ResponseEntity<List<FeedbackDto>> getGuideItineraryFeedback(@PathVariable Long itineraryId,
                                                                       @SessionAttribute("user") User user) {
        return ResponseEntity.ok(feedbackService.getFeedbackForGuideItinerary(itineraryId, user));
    }

    // GUIDE profile: average rating + count (public)
    @GetMapping("/guides/{guideId}/rating")
    public ResponseEntity<GuideRatingDto> getGuideRating(@PathVariable Long guideId) {
        return ResponseEntity.ok(feedbackService.getGuideRating(guideId));
    }

    // GUIDE profile: all reviews (public)
    @GetMapping("/guides/{guideId}/reviews")
    public ResponseEntity<List<FeedbackDto>> getGuideReviews(@PathVariable Long guideId) {
        return ResponseEntity.ok(feedbackService.getGuideReviews(guideId));
    }
}