package com.travelquest.travelquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO pentru crearea feedback-ului
 * Trimis de turist la finalizarea itinerarului
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFeedbackRequest {
    private int rating;          // 1-5 stele
    private String comment;      // text feedback (optional)
}
