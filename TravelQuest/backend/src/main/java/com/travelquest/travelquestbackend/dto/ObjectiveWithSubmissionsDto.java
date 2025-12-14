package com.travelquest.travelquestbackend.dto;

import java.util.List;

public record ObjectiveWithSubmissionsDto(
        Long objectiveId,
        String objectiveName,
        List<ObjectiveSubmissionDto> submissions
) {}