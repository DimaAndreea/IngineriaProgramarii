package com.travelquest.travelquestbackend.dto;

public class GuideRatingDto {

    private double averageRating;
    private long reviewsCount;

    public GuideRatingDto() {}

    public GuideRatingDto(double averageRating, long reviewsCount) {
        this.averageRating = averageRating;
        this.reviewsCount = reviewsCount;
    }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(long reviewsCount) { this.reviewsCount = reviewsCount; }
}
