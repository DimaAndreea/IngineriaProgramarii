package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionValidationRequest {
    @NotNull
    private SubmissionStatus status; // APPROVED sau REJECTED
}