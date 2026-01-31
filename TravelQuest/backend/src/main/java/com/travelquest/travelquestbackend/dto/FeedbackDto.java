package com.travelquest.travelquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * Response DTO pentru feedback
 * Returnat după salvare și pentru vizualizare
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private Long fromUserId;           // cine a dat feedback (turist)
    private String fromUsername;       // username turist
    private String fromUserAvatar;     // avatar turist (optional)
    
    private Long toUserId;             // cine a primit feedback (ghid)
    private String toUsername;         // username ghid
    
    private Long itineraryId;
    private String itineraryTitle;
    
    private int rating;                // 1-5 stele
    private String comment;            // comentariu
    
    private ZonedDateTime createdAt;   // când a fost dat feedback-ul
}
