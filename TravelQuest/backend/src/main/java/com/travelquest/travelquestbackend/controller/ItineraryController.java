package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.ItineraryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService service;

    public ItineraryController(ItineraryService service) {
        this.service = service;
    }

    // =====================================================
    // DEBUG
    // =====================================================
    @GetMapping("/whoami")
    public ResponseEntity<String> whoami(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            System.out.println(">>> WHOAMI: no user in session");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("No user in session");
        }

        System.out.println(">>> WHOAMI: " + user.getUsername() + " / " + user.getRole());
        return ResponseEntity.ok(
                "Logged in as: " + user.getUsername() + " role: " + user.getRole()
        );
    }

    // =====================================================
    // ACTIVE ITINERARIES (SPECIFIC ROUTES – SUS!)
    // =====================================================

    @GetMapping("/active/guide")
    public ResponseEntity<List<Itinerary>> getActiveForGuide(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (user.getRole() != UserRole.GUIDE)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        System.out.println(">>> getActiveForGuide for user " + user.getId());

        return ResponseEntity.ok(
                service.getActiveItinerariesForGuide(user)
        );
    }

    // =====================================================
    // CREATE
    // =====================================================
    @PostMapping
    public ResponseEntity<Itinerary> create(
            @RequestBody ItineraryRequest req,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Itinerary created = service.create(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // =====================================================
    // UPDATE
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> update(
            @PathVariable Long id,
            @RequestBody ItineraryRequest req,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(
                service.update(id, req, user)
        );
    }

    // =====================================================
    // DELETE
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        service.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // JOIN ITINERARY (TOURIST)
    // =====================================================
    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinItinerary(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must be logged in");

        try {
            return ResponseEntity.ok(
                    service.joinItinerary(id, user)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =====================================================
    // LISTS
    // =====================================================
    @GetMapping("/public")
    public ResponseEntity<List<Itinerary>> getPublic() {
        return ResponseEntity.ok(service.getPublic());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Itinerary>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    @GetMapping("/guide/{id}")
    public ResponseEntity<List<Itinerary>> getGuideItineraries(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGuideItineraries(id));
    }

    // =====================================================
    // ADMIN ACTIONS
    // =====================================================
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Itinerary> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Itinerary> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }

    // =====================================================
    // GET BY ID (GENERIC – ULTIMUL!)
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getById(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Itinerary it = service.getById(id);
        User user = (User) request.getSession().getAttribute("user");

        boolean isAdmin = user != null && user.getRole() == UserRole.ADMIN;
        boolean isCreator = user != null && it.getCreator().getId().equals(user.getId());

        if (isAdmin || isCreator || it.getStatus() == ItineraryStatus.APPROVED) {
            return ResponseEntity.ok(it);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
