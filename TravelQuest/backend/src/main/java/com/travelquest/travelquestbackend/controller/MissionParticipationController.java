package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.dto.MissionParticipationDto;
import com.travelquest.travelquestbackend.service.MissionParticipationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/missions")
public class MissionParticipationController {

    private final MissionParticipationService participationService;

    public MissionParticipationController(MissionParticipationService participationService) {
        this.participationService = participationService;
    }

    // ===============================
    // 🔗 JOIN MISSION
    // ===============================
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinMission(@PathVariable Long id, HttpServletRequest request) {
        System.out.println("=== DEBUG JOIN ===");
        System.out.println("Session ID: " + request.getSession().getId());
        Object sessionUser = request.getSession().getAttribute("user");
        System.out.println("User from session: " + sessionUser);

        User user = (User) sessionUser;
        if (user == null) {
            System.out.println("User is null -> returning 401");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        try {
            MissionParticipationDto participationDto = participationService.joinMission(id, user);
            System.out.println("Participation DTO: " + participationDto);
            return ResponseEntity.ok(participationDto);
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }


}
