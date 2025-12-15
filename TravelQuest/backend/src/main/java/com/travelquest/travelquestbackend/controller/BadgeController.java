package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.MyBadgeDto;
import com.travelquest.travelquestbackend.dto.SelectedBadgeDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.BadgeProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile/badges")
public class BadgeController {

    private final BadgeProfileService badgeProfileService;

    public BadgeController(BadgeProfileService badgeProfileService) {
        this.badgeProfileService = badgeProfileService;
    }

    /**
     * GET My Badges (locked + unlocked), pentru userul logat.
     */
    @GetMapping
    public ResponseEntity<List<MyBadgeDto>> getMyBadges(@SessionAttribute("user") User user) {
        return ResponseEntity.ok(badgeProfileService.getMyBadges(user.getId()));
    }

    /**
     * Selectează badge-ul ce va fi afișat public.
     */
    @PostMapping("/{badgeId}/select")
    public ResponseEntity<SelectedBadgeDto> selectBadge(@SessionAttribute("user") User user,
                                                        @PathVariable Long badgeId) {
        return ResponseEntity.ok(badgeProfileService.selectBadge(user.getId(), badgeId));
    }

    /**
     * Șterge badge-ul selectat (public).
     */
    @DeleteMapping("/selected")
    public ResponseEntity<Void> clearSelected(@SessionAttribute("user") User user) {
        badgeProfileService.clearSelectedBadge(user.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Pentru profil: badge-ul selectat (sau null).
     */
    @GetMapping("/selected")
    public ResponseEntity<SelectedBadgeDto> getSelected(@SessionAttribute("user") User user) {
        return ResponseEntity.ok(badgeProfileService.getSelectedBadge(user.getId()));
    }
}
