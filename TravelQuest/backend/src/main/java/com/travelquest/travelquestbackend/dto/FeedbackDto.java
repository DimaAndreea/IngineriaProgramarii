package com.travelquest.travelquestbackend.dto;

import java.time.ZonedDateTime;

public class FeedbackDto {

    private Long id;
    private int rating;
    private String comment;

    private Long fromUserId;
    private String fromUsername;

    private Long itineraryId;
    private String itineraryTitle;

    private ZonedDateTime createdAt;

    public FeedbackDto() {}

    public FeedbackDto(Long id, int rating, String comment,
                       Long fromUserId, String fromUsername,
                       Long itineraryId, String itineraryTitle,
                       ZonedDateTime createdAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.fromUserId = fromUserId;
        this.fromUsername = fromUsername;
        this.itineraryId = itineraryId;
        this.itineraryTitle = itineraryTitle;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Long getFromUserId() { return fromUserId; }
    public void setFromUserId(Long fromUserId) { this.fromUserId = fromUserId; }

    public String getFromUsername() { return fromUsername; }
    public void setFromUsername(String fromUsername) { this.fromUsername = fromUsername; }

    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long itineraryId) { this.itineraryId = itineraryId; }

    public String getItineraryTitle() { return itineraryTitle; }
    public void setItineraryTitle(String itineraryTitle) { this.itineraryTitle = itineraryTitle; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
