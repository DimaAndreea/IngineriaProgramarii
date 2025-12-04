package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.util.List; // <--- IMPORT LIST

@Data
public class ItineraryRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 20, message = "Title too long")
    private String title;

    @Size(max = 100, message = "Description too long")
    private String description;

    private String category;

    @NotBlank(message = "Image URL is required")
    @JsonProperty("image_url")
    private String imageUrl;

    @Min(value = 0, message = "Price cannot be negative")
    private Integer price;

    @NotNull(message = "Start date is required")
    @JsonProperty("itinerary_start_date")
    private LocalDate itineraryStartDate;

    @NotNull(message = "End date is required")
    @JsonProperty("itinerary_end_date")
    private LocalDate itineraryEndDate;

    // --- NOUL CÂMP PENTRU LOCAȚII ---
    @JsonProperty("locations") // Asta leagă JSON-ul din frontend de backend
    private List<LocationRequest> locations;
}