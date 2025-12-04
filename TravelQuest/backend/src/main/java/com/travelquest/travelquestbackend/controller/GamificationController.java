package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.MissionRequest;
import com.travelquest.travelquestbackend.dto.SubmissionValidationRequest;
import com.travelquest.travelquestbackend.model.ObjectiveMission;
import com.travelquest.travelquestbackend.model.Submission;
import com.travelquest.travelquestbackend.service.GamificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    // 1. GHID: Creează o misiune pentru o locație din itinerariu
    @PostMapping("/itineraries/{itineraryId}/missions")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> createMission(
            @PathVariable Long itineraryId,
            @Valid @RequestBody MissionRequest request) {
        return ResponseEntity.ok(gamificationService.createMission(itineraryId, request));
    }

    // 2. TURIST: Trimite o dovadă (Submission)
    // Body simplu JSON: { "url": "http://image..." }
    @PostMapping("/missions/{missionId}/submit")
    @PreAuthorize("hasRole('TOURIST')")
    public ResponseEntity<?> submitProof(
            @PathVariable Long missionId,
            @RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        return ResponseEntity.ok(gamificationService.createSubmission(missionId, url));
    }

    // 3. GHID: Vezi ce ai de validat (Pending)
    @GetMapping("/submissions/pending")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<List<Submission>> getPendingSubmissions() {
        return ResponseEntity.ok(gamificationService.getPendingSubmissions());
    }

    // 4. GHID: Validează (Approve/Reject)
    @PutMapping("/submissions/{submissionId}/validate")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<?> validateSubmission(
            @PathVariable Long submissionId,
            @RequestBody SubmissionValidationRequest request) {
        return ResponseEntity.ok(gamificationService.validateSubmission(submissionId, request.getStatus()));
    }
}