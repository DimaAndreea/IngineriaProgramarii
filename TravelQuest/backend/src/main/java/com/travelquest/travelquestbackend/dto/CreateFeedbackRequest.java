package com.travelquest.travelquestbackend.dto;

public class CreateFeedbackRequest {
    private Integer rating;
    private String comment;

    public CreateFeedbackRequest() {}

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
