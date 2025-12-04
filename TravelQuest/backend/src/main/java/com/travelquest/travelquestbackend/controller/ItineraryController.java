package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.service.ItineraryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    // Create - Doar pentru GHID
    @PostMapping
    @PreAuthorize("hasRole('GUIDE')") 
    public ResponseEntity<?> createItinerary(@Valid @RequestBody ItineraryRequest request) {
        try {
            // Apelează metoda care acceptă DTO (ItineraryRequest)
            Itinerary created = itineraryService.createItinerary(request);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating itinerary: " + e.getMessage());
        }
    }

    // Get My Itineraries - Doar pentru GHID
    @GetMapping("/mine")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<List<Itinerary>> getMyItineraries() {
        return ResponseEntity.ok(itineraryService.getMyItineraries());
    }

    // Update - Doar pentru GHID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> updateItinerary(@PathVariable Long id, @Valid @RequestBody ItineraryRequest request) {
        try {
            Itinerary updated = itineraryService.updateItinerary(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Delete - Doar pentru GHID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> deleteItinerary(@PathVariable Long id) {
        try {
            itineraryService.deleteItinerary(id);
            return ResponseEntity.ok("Itinerary deleted successfully");
        } catch (RuntimeException e) {
             if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}