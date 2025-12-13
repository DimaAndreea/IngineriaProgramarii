package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.ItineraryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService service;

    public ItineraryController(ItineraryService service) {
        this.service = service;
    }

    // ======================
    // CREATE ITINERARY
    // ======================
    @PostMapping
    public ResponseEntity<Itinerary> create(@RequestBody ItineraryRequest req, HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Itinerary created = service.create(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ======================
    // UPDATE ITINERARY
    // ======================
    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> update(@PathVariable Long id, @RequestBody ItineraryRequest req, HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Itinerary updated = service.update(id, req, user);
        return ResponseEntity.ok(updated);
    }

    // ======================
    // DELETE ITINERARY
    // ======================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        service.delete(id, user);
        return ResponseEntity.noContent().build();
    }


    // ===========================
    // GUIDE — ACTIVE ITINERARIES
    // ===========================
    @GetMapping("/active")
    public List<Itinerary> getActiveForGuide(HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");

        //doar pentru testare fara frontend
        System.out.println(">>> getActiveForGuide called for user " + user.getId());


        if (user == null || !"GUIDE".equals(user.getRole().name())) {
            throw new RuntimeException("Only guides can view their active itineraries.");
        }

        return service.getActiveItinerariesForGuide(user);
    }

    // ======================
    // JOIN ITINERARY – TOURIST
    // ======================
    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinItinerary(@PathVariable("id") Long itineraryId, HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in to join an itinerary");
        }
        try {
            String message = service.joinItinerary(itineraryId, user);
            return ResponseEntity.ok(message);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + ex.getMessage());
        }
    }

    // ======================
    // GET ITINERARY BY ID (WITH VISIBILITY CHECK)
    // ======================
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getById(@PathVariable Long id, HttpServletRequest request) {
        Itinerary it = service.getById(id);
        User user = (User) request.getSession().getAttribute("user");

        boolean isCreator = user != null && it.getCreator().getId().equals(user.getId());
        boolean isAdmin = user != null && user.getRole() == UserRole.ADMIN;

        if (isAdmin || it.getStatus() == ItineraryStatus.APPROVED || isCreator) {
            return ResponseEntity.ok(it);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // ======================
    // GET ACTIVE ITINERARY FOR TOURIST
    // ======================
    @GetMapping("/active/tourist")
    public ResponseEntity<Itinerary> getActiveItineraryForTourist(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null || user.getRole() != UserRole.TOURIST) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Obținem itinerariul activ
        Itinerary activeItinerary = service.getActiveItineraryForTourist(user);

        // Returnăm null dacă nu există
        if (activeItinerary == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(activeItinerary);
    }


    // ======================
    // GET GUIDE ITINERARIES
    // ======================
    @GetMapping("/guide/{id}")
    public ResponseEntity<List<Itinerary>> guideItineraries(@PathVariable Long id) {
        List<Itinerary> itineraries = service.getGuideItineraries(id);
        return ResponseEntity.ok(itineraries);
    }

    // ======================
    // GET PUBLIC ITINERARIES
    // ======================
    @GetMapping("/public")
    public ResponseEntity<List<Itinerary>> publicList() {
        return ResponseEntity.ok(service.getPublic());
    }

    // ======================
    // GET PENDING ITINERARIES (ADMIN)
    // ======================
    @GetMapping("/pending")
    public ResponseEntity<List<Itinerary>> pending() {
        return ResponseEntity.ok(service.getPending());
    }

    // ======================
    // ADMIN ACTIONS — APPROVE / REJECT
    // ======================
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Itinerary> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Itinerary> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
