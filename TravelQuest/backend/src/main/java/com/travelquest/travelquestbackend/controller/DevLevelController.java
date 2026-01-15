package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.service.LevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dev/levels")
public class DevLevelController {

    private final LevelService levelService;

    public DevLevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/recalculate/{userId}")
    public ResponseEntity<String> recalculate(@PathVariable Long userId) {
        int newLevel = levelService.recalculateLevel(userId);
        return ResponseEntity.ok("Recalculated. New level = " + newLevel);
    }
}
