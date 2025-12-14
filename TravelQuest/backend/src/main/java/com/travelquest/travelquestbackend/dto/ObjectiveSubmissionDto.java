package com.travelquest.travelquestbackend.dto;

import java.time.OffsetDateTime;

public record ObjectiveSubmissionDto(
        Long submissionId,
        Long touristId,
        String touristUsername,
        int touristLevel,
        String submissionUrl,
        String status,
        OffsetDateTime submittedAt,
        OffsetDateTime validatedAt
) {}