package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ItineraryFilter;
import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.ItineraryService_Filter_Sort;
import com.travelquest.travelquestbackend.service.RegisterService;
import com.travelquest.travelquestbackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController_Filter_Sort {

    private final ItineraryService_Filter_Sort filterService;
    private final UserService userService;

    public ItineraryController_Filter_Sort(ItineraryService_Filter_Sort filterService,
                                           UserService userService) {
        this.filterService = filterService;
        this.userService = userService;
    }

    @PostMapping("/filter")
    public ResponseEntity<List<Itinerary>> filterItineraries(
            @RequestBody ItineraryFilter filterDTO,
            @RequestHeader("userId") Long userId
    ) {
        User loggedUser = userService.getById(userId);
        List<Itinerary> result = filterService.filter(filterDTO, loggedUser);
        return ResponseEntity.ok(result);
    }
}
