package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.UserProfileDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    // ===============================
    // PROFILUL MEU (Guide / Tourist)
    // ===============================
    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(HttpServletRequest request) {
        User user = (User) request.getSession().getAttribute("user");

        UserProfileDto dto = profileService.getMyProfile(user);
        return ResponseEntity.ok(dto);
    }

    // ===============================
    // 🌍 PROFIL PUBLIC GHID
    // ===============================
    @GetMapping("/guides/{id}")
    public ResponseEntity<UserProfileDto> getGuideProfile(@PathVariable Long id) {
        UserProfileDto dto = profileService.getGuideProfile(id);
        return ResponseEntity.ok(dto);
    }
}
