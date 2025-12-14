package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.ObjectiveSubmission;
import lombok.Data;

import java.util.List;

@Data
public class ActiveItineraryTouristDto {

    private Long id;
    private String title;
    private List<LocationDto> locations;
    private List<ObjectiveSubmission> submissions;
    private int currentStageIndex = 0;

    @Data
    public static class LocationDto {
        private Long id;
        private String city;
        private String country;
        private List<MissionDto> missions;

        @Data
        public static class MissionDto {
            private Long id;
            private String text;
        }
    }

    // Factory method
    public static ActiveItineraryTouristDto fromItinerary(
            com.travelquest.travelquestbackend.model.Itinerary itinerary,
            List<ObjectiveSubmission> submissions
    ) {
        ActiveItineraryTouristDto dto = new ActiveItineraryTouristDto();
        dto.id = itinerary.getId();
        dto.title = itinerary.getTitle();
        dto.submissions = submissions;

        dto.locations = itinerary.getLocations().stream().map(loc -> {
            LocationDto locDto = new LocationDto();
            locDto.id = loc.getId();
            locDto.city = loc.getCity();
            locDto.country = loc.getCountry();

            locDto.missions = loc.getObjectives().stream().map(obj -> {
                LocationDto.MissionDto mDto = new LocationDto.MissionDto();
                mDto.id = obj.getId();
                mDto.text = obj.getName();
                return mDto;
            }).toList();

            return locDto;
        }).toList();

        return dto;
    }
}
