package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.service.MissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @GetMapping
    public ResponseEntity<List<Mission>> getAllMissions() {
        List<Mission> missions = missionService.getAllMissions();
        return ResponseEntity.ok(missions);
    }

    @PostMapping
    public ResponseEntity<Mission> createMission(@RequestBody @Valid MissionDto dto) {
        System.out.println("=== CREATE MISSION REQUEST ===");
        System.out.println("Title: " + dto.getTitle());
        System.out.println("Description: " + dto.getDescription());
        System.out.println("Deadline: " + dto.getDeadline());
        System.out.println("Reward Points: " + dto.getRewardPoints());
        System.out.println("Status: " + dto.getStatus());
        System.out.println("Scope: " + dto.getScope());
        System.out.println("=============================");

        Long adminId = 1L;
        Mission mission = missionService.createMission(dto, adminId);

        return ResponseEntity.status(HttpStatus.CREATED).body(mission);
    }

}
