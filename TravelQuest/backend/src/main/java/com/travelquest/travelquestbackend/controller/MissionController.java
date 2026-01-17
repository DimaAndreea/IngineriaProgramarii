package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.service.MissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    // ===============================
    // LIST ALL MISSIONS
    // ===============================
    @GetMapping
    public ResponseEntity<List<Mission>> getAllMissions() {
        List<Mission> missions = missionService.getAllMissions();
        return ResponseEntity.ok(missions);
    }

    // ===============================
    // CREATE MISSION
    // ===============================
    @PostMapping
    public ResponseEntity<Mission> createMission(@RequestBody @Valid MissionDto dto) {
        Long adminId = 1L; // MOCK admin
        Mission mission = missionService.createMission(dto, adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(mission);
    }

    // ===============================
    // MISSION METADATA (for frontend)
    // ===============================
    @GetMapping("/meta")
    public ResponseEntity<?> getMissionMeta() {
        // MOCK metadata, poți înlocui cu valori reale din DB
        Map<String, Object> meta = Map.of(
                "roles", List.of("TOURIST", "GUIDE"),
                "types", List.of(
                        Map.of("value", "VISIT_MUSEUM", "role", "TOURIST", "label", "Visit museum", "paramsSchema", Map.of("category", true)),
                        Map.of("value", "WALK_TOUR", "role", "GUIDE", "label", "Organize tour", "paramsSchema", Map.of())
                ),
                "categories", List.of("History", "Art", "Nature")
        );
        return ResponseEntity.ok(meta);
    }
}
