package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.UserRepository;
import com.travelquest.travelquestbackend.service.BadgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dev/badges")
public class DevBadgeController {

    private final BadgeService badgeService;
    private final UserRepository userRepository;

    public DevBadgeController(BadgeService badgeService, UserRepository userRepository) {
        this.badgeService = badgeService;
        this.userRepository = userRepository;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/unlock/{userId}")
    public ResponseEntity<String> unlockForUser(@PathVariable Long userId) {
        badgeService.unlockBadgesForUser(userId);
        return ResponseEntity.ok("Badges unlocked (if eligible) for user " + userId);
    }

    @PostMapping("/unlock-all")
    public ResponseEntity<String> unlockForAllUsers() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            badgeService.unlockBadgesForUser(u.getId());
        }
        return ResponseEntity.ok("Badges unlocked for all users.");
    }
}
