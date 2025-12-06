package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.ItineraryCategory;
import com.travelquest.travelquestbackend.model.ItineraryStatus;
import java.util.List;

public class ItineraryRequest {

    private String title;
    private String description;
    private String category;
    private int price;
    private String imageBase64;
    private String startDate;  
    private String endDate;

    private ItineraryStatus status = ItineraryStatus.PENDING; // DEFAULT

    private Long guideId;
    private List<LocationDto> locations;

    public static class LocationDto {
        private String country;
        private String city;
        private List<String> objectives;

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public List<String> getObjectives() { return objectives; }
        public void setObjectives(List<String> objectives) { this.objectives = objectives; }
    }

    // ===========================
    // GETTERS + SETTERS
    // ===========================

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public ItineraryStatus getStatus() { return status; }
    public void setStatus(ItineraryStatus status) { this.status = status; }

    public Long getGuideId() { return guideId; }
    public void setGuideId(Long guideId) { this.guideId = guideId; }

    public List<LocationDto> getLocations() { return locations; }
    public void setLocations(List<LocationDto> locations) { this.locations = locations; }

}
