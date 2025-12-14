package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.UpdateSubmissionStatusRequest;
import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import com.travelquest.travelquestbackend.model.SubmissionStatus;
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
public class GuideSubmissionsController {

    private final ItinerarySubmissionService submissionService;

    public GuideSubmissionsController(ItinerarySubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ✅ Ghidul vede toate submisiile pentru itinerariu (istoric inclus)
    @GetMapping("/{itineraryId}/submissions")
    public ResponseEntity<?> getSubmissionsForGuide(
            @PathVariable Long itineraryId,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        if (user.getRole() != UserRole.GUIDE) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not a guide");

        try {
            List<ObjectiveSubmission> submissions = submissionService.getSubmissionsForGuide(itineraryId, user);
            return ResponseEntity.ok(submissions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ Ghidul validează: APPROVED / REJECTED
    @PatchMapping("/{itineraryId}/submissions/{submissionId}")
    public ResponseEntity<?> updateSubmissionStatus(
            @PathVariable Long itineraryId,
            @PathVariable Long submissionId,
            @RequestBody UpdateSubmissionStatusRequest body,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        if (user.getRole() != UserRole.GUIDE) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not a guide");

        try {
            SubmissionStatus newStatus = SubmissionStatus.valueOf(body.getStatus());
            ObjectiveSubmission updated = submissionService.updateSubmissionStatus(itineraryId, submissionId, user, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
