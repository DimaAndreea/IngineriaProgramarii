package com.travelquest.travelquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pentru rating agregat al ghidului
 * Afișat pe profilul ghidului
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuideRatingDto {
    private Long guideId;
    private String guideUsername;
    
    private double averageRating;      // media rating-urilor (0.0 dacă nu sunt feedback-uri)
    private long totalReviews;         // numărul total de feedback-uri
}
