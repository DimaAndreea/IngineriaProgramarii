package com.travelquest.travelquestbackend.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class ItineraryRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 20, message = "Title too long")
    private String title;

    @Size(max = 100, message = "Description too long")
    private String description;

    private String category;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @Min(value = 0, message = "Price cannot be negative")
    private Integer price;

    @NotNull(message = "Start date is required")
    private LocalDate itineraryStartDate;

    @NotNull(message = "End date is required")
    private LocalDate itineraryEndDate;
}