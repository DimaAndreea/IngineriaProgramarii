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
        return ResponseEntity.ok(missionService.getAllMissions());
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
    // MISSION METADATA (FRONTEND)
    // ===============================
    @GetMapping("/meta")
    public ResponseEntity<?> getMissionMeta() {

        return ResponseEntity.ok(
                Map.of(
                        "roles", List.of("TOURIST", "GUIDE"),

                        "types", List.of(
                                // ================= GUIDE =================
                                Map.of(
                                        "value", "GUIDE_PUBLISH_ITINERARY_COUNT",
                                        "role", "GUIDE",
                                        "label", "Publish itineraries",
                                        "paramsSchema", Map.of()
                                ),
                                Map.of(
                                        "value", "GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT",
                                        "role", "GUIDE",
                                        "label", "Participants in itinerary category",
                                        "paramsSchema", Map.of(
                                                "category", true
                                        )
                                ),
                                Map.of(
                                        "value", "GUIDE_EVALUATE_SUBMISSIONS_COUNT",
                                        "role", "GUIDE",
                                        "label", "Evaluate submissions",
                                        "paramsSchema", Map.of()
                                ),

                                // ================= TOURIST =================
                                Map.of(
                                        "value", "TOURIST_JOIN_ITINERARY_COUNT",
                                        "role", "TOURIST",
                                        "label", "Join itineraries",
                                        "paramsSchema", Map.of()
                                ),
                                Map.of(
                                        "value", "TOURIST_JOIN_ITINERARY_CATEGORY_COUNT",
                                        "role", "TOURIST",
                                        "label", "Join itineraries in category",
                                        "paramsSchema", Map.of(
                                                "category", true
                                        )
                                ),
                                Map.of(
                                        "value", "TOURIST_APPROVED_SUBMISSIONS_COUNT",
                                        "role", "TOURIST",
                                        "label", "Approved submissions",
                                        "paramsSchema", Map.of()
                                ),
                                Map.of(
                                        "value", "TOURIST_APPROVED_SUBMISSIONS_CATEGORY_COUNT",
                                        "role", "TOURIST",
                                        "label", "Approved submissions in category",
                                        "paramsSchema", Map.of(
                                                "category", true
                                        )
                                ),
                                Map.of(
                                        "value", "TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT",
                                        "role", "TOURIST",
                                        "label", "Approved submissions in same itinerary",
                                        "paramsSchema", Map.of(
                                                "itinerary", true
                                        )
                                )
                        ),

                        "categories", List.of(
                                "History",
                                "Art",
                                "Nature",
                                "Food",
                                "Adventure"
                        )
                )
        );
    }
}
