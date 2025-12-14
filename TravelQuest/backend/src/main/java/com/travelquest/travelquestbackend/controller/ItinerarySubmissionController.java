package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.ObjectiveSubmissionRequest;
import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.ItinerarySubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItinerarySubmissionController {

    private final ItinerarySubmissionService service;

    public ItinerarySubmissionController(ItinerarySubmissionService service) {
        this.service = service;
    }

    /**
     * Turistul trimite o imagine (base64) pentru un obiectiv.
     * Body JSON:
     * {
     *   "objectiveId": 123,
     *   "submissionBase64": "data:image/png;base64,...."
     * }
     */
    @PostMapping("/{id}/submit-photo")
    public ResponseEntity<?> submitPhoto(
            @PathVariable("id") Long itineraryId,
            @RequestBody ObjectiveSubmissionRequest req,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null || user.getRole() != UserRole.TOURIST) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("You must be logged in as a tourist to submit photos");
        }

        try {
            service.submitPhoto(itineraryId, req.getObjectiveId(), user, req.getSubmissionBase64());
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
