package com.travelquest.travelquestbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class LocationDto {
    private String country;
    private String city;
    private List<String> objectives; 
}
