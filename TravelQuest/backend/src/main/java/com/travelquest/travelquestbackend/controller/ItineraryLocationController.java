package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.LocationRequest;
import com.travelquest.travelquestbackend.model.ItineraryLocation;
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
public class ItineraryLocationController {

    @Autowired
    private ItineraryService locationService;

    // Adaugă o locație la un itinerariu specific
    // POST /api/itineraries/{itineraryId}/locations
    @PostMapping("/{itineraryId}/locations")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> addLocation(
            @PathVariable Long itineraryId,
            @Valid @RequestBody LocationRequest request) {
        try {
            ItineraryLocation created = locationService.addLocation(itineraryId, request);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Vezi toate locațiile unui itinerariu
    // GET /api/itineraries/{itineraryId}/locations
    @GetMapping("/{itineraryId}/locations")
    public ResponseEntity<List<ItineraryLocation>> getLocations(@PathVariable Long itineraryId) {
        return ResponseEntity.ok(locationService.getLocations(itineraryId));
    }

    // Șterge o locație specifică (după ID-ul locației)
    // DELETE /api/itineraries/locations/{locationId}
    @DeleteMapping("/locations/{locationId}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> deleteLocation(@PathVariable Long locationId) {
        try {
            locationService.deleteLocation(locationId);
            return ResponseEntity.ok("Location deleted successfully");
        } catch (RuntimeException e) {
             if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}