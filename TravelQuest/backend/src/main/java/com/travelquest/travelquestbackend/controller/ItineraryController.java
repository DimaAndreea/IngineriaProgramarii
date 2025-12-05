package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.ItineraryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryService service;

    public ItineraryController(ItineraryService service) {
        this.service = service;
    }

    // ======================
    // CREATE
    // ======================
    @PostMapping
    public Itinerary create(@RequestBody ItineraryRequest req, HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        return service.create(req, user);
    }

    // ======================
    // UPDATE
    // ======================
    @PutMapping("/{id}")
    public Itinerary update(@PathVariable Long id, @RequestBody ItineraryRequest req, HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        return service.update(id, req, user);
    }

    // ======================
    // DELETE
    // ======================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        service.delete(id, user);
    }

    // ======================
    // ADMIN — GET ALL PENDING
    // ======================
    @GetMapping("/pending")
    public List<Itinerary> pending() {
        return service.getPending();
    }

    // ======================
    // GET ONE (VISIBILITY RULE APPLIED)
    // ======================
    @GetMapping("/{id}")
    public Itinerary getById(@PathVariable Long id, HttpServletRequest request) {

        Itinerary it = service.getById(id);

        User user = (User) request.getSession().getAttribute("user");

        boolean isCreator = (user != null && it.getCreator().getId().equals(user.getId()));
        boolean isAdmin = (user != null && user.getRole().name().equals("ADMIN"));

        // ADMIN poate vedea orice
        if (isAdmin) {
            return it;
        }

        // Oricine poate vedea itinerarii APPROVED
        if (it.getStatus() == ItineraryStatus.APPROVED) {
            return it;
        }

        // Creatorul poate vedea propriile itinerarii neaprobate
        if (isCreator) {
            return it;
        }

        // Altfel -> acces interzis
        throw new RuntimeException("You are not allowed to view this itinerary.");
    }


    // ======================
    // OTHER GETTERS
    // ======================
    @GetMapping("/guide/{id}")
    public List<Itinerary> guideItineraries(@PathVariable Long id) {
        return service.getGuideItineraries(id);
    }

    @GetMapping("/public")
    public List<Itinerary> publicList() {
        return service.getPublic();
    }

    // ======================
    // ADMIN ACTIONS
    // ======================
    @PatchMapping("/{id}/approve")
    public Itinerary approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PatchMapping("/{id}/reject")
    public Itinerary reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
