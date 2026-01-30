package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.GamificationSummaryDto;
import com.travelquest.travelquestbackend.dto.ProfileLevelDto;
import com.travelquest.travelquestbackend.dto.ProfilePointsDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.ProfileGamificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ProfilePointsDto> getPoints(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(profileGamificationService.getPoints(user.getId()));
    }

    @GetMapping("/level")
    public ResponseEntity<ProfileLevelDto> getLevel(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(profileGamificationService.getLevelProgress(user.getId()));
    }

    @GetMapping("/summary")
    public ResponseEntity<GamificationSummaryDto> getSummary(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(profileGamificationService.getSummary(user.getId()));
    }
}
