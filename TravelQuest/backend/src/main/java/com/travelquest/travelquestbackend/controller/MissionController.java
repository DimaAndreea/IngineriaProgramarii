package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.MissionDto;
import com.travelquest.travelquestbackend.dto.RewardDto;
import com.travelquest.travelquestbackend.model.Mission;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.RewardRepository;
import com.travelquest.travelquestbackend.service.MissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;
    private final RewardRepository rewardRepository;

    public MissionController(MissionService missionService,
                             RewardRepository rewardRepository) {
        this.missionService = missionService;
        this.rewardRepository = rewardRepository;
    }

    // ===============================
    // LIST MISSIONS
    // ===============================
    @GetMapping
    public ResponseEntity<List<MissionService.MissionForUserDto>> getAllMissions(
            HttpServletRequest request
    ) {
        User user = (User) request.getSession().getAttribute("user");
        Long userId = user != null ? user.getId() : null;
        List<MissionService.MissionForUserDto> result = missionService.getAllMissionsForUser(userId);
        return ResponseEntity.ok(result);
    }

    // ===============================
    // CREATE MISSION
    // ===============================
    @PostMapping
    public ResponseEntity<Mission> createMission(
            @RequestBody @Valid MissionDto dto
    ) {
        Long adminId = 1L; // TODO: replace with authenticated admin
        Mission mission = missionService.createMission(dto, adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(mission);
    }

    // ===============================
    // GET MISSION METADATA
    // ===============================
    @GetMapping("/meta")
    public ResponseEntity<?> getMissionMetadata() {
        return ResponseEntity.ok(missionService.getMissionMetadata());
    }

}