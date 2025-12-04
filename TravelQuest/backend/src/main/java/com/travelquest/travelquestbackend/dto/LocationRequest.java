package com.travelquest.travelquestbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationRequest {
    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Objective name is required")
    private String objectiveName;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;
}