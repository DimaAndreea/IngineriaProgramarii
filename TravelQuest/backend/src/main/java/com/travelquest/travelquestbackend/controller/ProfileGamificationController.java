package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.GamificationSummaryDto;
import com.travelquest.travelquestbackend.dto.ProfileLevelDto;
import com.travelquest.travelquestbackend.dto.ProfilePointsDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.ProfileGamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/gamification")
public class ProfileGamificationController {

    private final ProfileGamificationService profileGamificationService;

    public ProfileGamificationController(ProfileGamificationService profileGamificationService) {
        this.profileGamificationService = profileGamificationService;
    }

    @GetMapping("/points")
    public ResponseEntity<ProfilePointsDto> getPoints(@SessionAttribute("user") User user) {
        return ResponseEntity.ok(profileGamificationService.getPoints(user.getId()));
    }

    @GetMapping("/level")
    public ResponseEntity<ProfileLevelDto> getLevel(@SessionAttribute("user") User user) {
        return ResponseEntity.ok(profileGamificationService.getLevelProgress(user.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<GamificationSummaryDto> getSummary(@SessionAttribute("user") User user) {
        return ResponseEntity.ok(profileGamificationService.getSummary(user.getId()));
    }
}
