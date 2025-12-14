package com.travelquest.travelquestbackend.dto;

import lombok.Data;

@Data
public class ObjectiveSubmissionRequest {
    private Long objectiveId;
    private String submissionBase64;
}
