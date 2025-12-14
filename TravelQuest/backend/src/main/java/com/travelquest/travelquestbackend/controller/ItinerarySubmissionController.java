package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.ItinerarySubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItinerarySubmissionController {

    private final ItinerarySubmissionService service;

    public ItinerarySubmissionController(ItinerarySubmissionService service) {
        this.service = service;
    }

    @PostMapping("/{id}/submit-photo")
    public ResponseEntity<?> submitPhoto(
            @PathVariable("id") Long itineraryId,
            @RequestParam("objectiveId") Long objectiveId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null || user.getRole() != UserRole.TOURIST) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must be logged in as a tourist to submit photos");
        }

        System.out.println("Request has file? " + (file != null));
        System.out.println("objectiveId: " + objectiveId);


        try {
            ObjectiveSubmission submission = service.submitPhoto(itineraryId, objectiveId, user, file);
            List<ObjectiveSubmission> allSubmissions = service.getSubmissionsForTourist(itineraryId, user);
            return ResponseEntity.ok(allSubmissions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }

    }

}
