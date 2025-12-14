package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ActiveItineraryTouristDto;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.service.ItinerarySubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ActiveItineraryTouristController {

    private final ItineraryRepository itineraryRepository;
    private final ItinerarySubmissionService submissionService;

    public ActiveItineraryTouristController(ItineraryRepository itineraryRepository,
                                            ItinerarySubmissionService submissionService) {
        this.itineraryRepository = itineraryRepository;
        this.submissionService = submissionService;
    }

    @GetMapping("/active/tourist")
    public ActiveItineraryTouristDto getActiveItinerary(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null || user.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("You must be logged in as a tourist");
        }

        LocalDate today = LocalDate.now();

        // Preluăm itinerariul activ al turistului
        List<Itinerary> activeItineraries = itineraryRepository.findActiveItinerariesForTourist(user.getId(), today);

        if (activeItineraries == null || activeItineraries.isEmpty()) {
            System.out.println("No active itineraries found for user " + user.getUsername());
            return null; // frontend-ul va trata lipsa itinerariului
        }

        Itinerary itinerary = activeItineraries.get(0);

        // Protecție împotriva null și lazy loading
        if (itinerary.getLocations() != null) {
            itinerary.getLocations().forEach(loc -> {
                if (loc.getObjectives() != null) {
                    loc.getObjectives().size(); // forțăm încărcarea LAZY
                }
            });
        }

        // Preluăm submisiile turistului pentru itinerariu
        List<ObjectiveSubmission> submissions = submissionService.getSubmissionsForTourist(itinerary.getId(), user);

        // Construim DTO-ul folosind metoda statică din DTO
        ActiveItineraryTouristDto dto = ActiveItineraryTouristDto.fromItinerary(itinerary, submissions);

        // Log clar pentru debugging
        System.out.println("=== Active Itinerary DTO for tourist ===");
        System.out.println("Itinerary ID: " + itinerary.getId());
        System.out.println("Title: " + itinerary.getTitle());
        System.out.println("Locations count: " + (itinerary.getLocations() != null ? itinerary.getLocations().size() : 0));
        System.out.println("Submissions count: " + (submissions != null ? submissions.size() : 0));

        return dto;
    }
}
