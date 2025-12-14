package com.travelquest.travelquestbackend.dto;

import java.util.List;

public record LocationSubmissionsDto(
        Long locationId,
        String country,
        String city,
        List<ObjectiveWithSubmissionsDto> objectives
) {}