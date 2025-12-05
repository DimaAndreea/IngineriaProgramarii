package com.travelquest.travelquestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class LocationRequest {
    @JsonProperty("country")
    private String country;

    @JsonProperty("city")
    private String city;

    // --- MODIFICARE AICI ---
    // Era: List<MissionRequest> objectives;
    // Acum: List<String> objectives; (Acceptăm text simplu de la frontend)
    @JsonProperty("objectives") 
    private List<String> objectives; 

    private Integer orderIndex = 1;
}