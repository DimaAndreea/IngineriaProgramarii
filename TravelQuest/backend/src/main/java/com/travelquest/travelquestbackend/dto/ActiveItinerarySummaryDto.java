package com.travelquest.travelquestbackend.dto;

import java.time.LocalDate;

public record ActiveItinerarySummaryDto(
        Long id,
        String title,
        LocalDate startDate,
        LocalDate endDate
) {}
