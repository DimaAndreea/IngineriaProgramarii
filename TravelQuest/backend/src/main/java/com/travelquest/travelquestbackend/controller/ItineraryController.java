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
    // GUIDE — ACTIVE ITINERARIES
    // ======================
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
    // ADMIN — GET ALL ITINERARIES
    // ======================
    @GetMapping
    public List<Itinerary> getAll(HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");

        if (user == null || !"ADMIN".equals(user.getRole().name())) {
            throw new RuntimeException("Only admin can view all itineraries.");
        }

        return service.getAll();
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

        if (isAdmin) return it;

        if (it.getStatus() == ItineraryStatus.APPROVED) return it;

        if (isCreator) return it;

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
