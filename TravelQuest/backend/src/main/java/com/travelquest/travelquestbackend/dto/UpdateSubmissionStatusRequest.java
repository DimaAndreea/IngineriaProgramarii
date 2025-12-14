package com.travelquest.travelquestbackend.dto;

import lombok.Data;

@Data
public class UpdateSubmissionStatusRequest {
    private String status; // "APPROVED" / "REJECTED"
}
