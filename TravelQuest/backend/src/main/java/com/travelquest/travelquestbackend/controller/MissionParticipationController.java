package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.MissionParticipationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/missions")
public class MissionParticipationController {

    private final MissionParticipationService participationService;

    public MissionParticipationController(
            MissionParticipationService participationService
    ) {
        this.participationService = participationService;
    }

    // ===============================
    // JOIN MISSION
    // ===============================
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinMission(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Not authenticated");
        }

        return ResponseEntity.ok(
                participationService.joinMission(id, user)
        );
    }

    // ===============================
    // CLAIM MISSION
    // ===============================
    @PostMapping("/{id}/claim")
    public ResponseEntity<RewardDto> claimMission(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                participationService.claimMission(id, user)
        );
    }

    // ===============================
    // MY REWARDS
    // ===============================
    @GetMapping("/my-rewards")
    public ResponseEntity<?> myRewards(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                participationService.getMyRewards(user)
        );
    }
}
