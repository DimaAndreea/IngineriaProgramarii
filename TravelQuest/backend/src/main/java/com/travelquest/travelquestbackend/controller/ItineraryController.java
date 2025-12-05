package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.Itinerary;
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

    @PostMapping
    public Itinerary create(@RequestBody ItineraryRequest req, HttpServletRequest request) {

        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            throw new RuntimeException("Not logged in");
        }

        return service.create(req, user);
    }

    @PutMapping("/{id}")
    public Itinerary update(@PathVariable Long id, @RequestBody ItineraryRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/guide/{id}")
    public List<Itinerary> guideItineraries(@PathVariable Long id) {
        return service.getGuideItineraries(id);
    }

    @GetMapping("/public")
    public List<Itinerary> publicList() {
        return service.getPublic();
    }

    @PatchMapping("/{id}/approve")
    public Itinerary approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PatchMapping("/{id}/reject")
    public Itinerary reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
