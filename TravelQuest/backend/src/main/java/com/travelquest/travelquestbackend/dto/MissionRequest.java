package com.travelquest.travelquestbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MissionRequest {
    @NotBlank(message = "Description is required")
    private String description;

    private Integer rewardXp = 50;
    
    // ID-ul locației pentru care se face misiunea
    private Long locationId; 
}