package com.travelquest.travelquestbackend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ItineraryCategoryConverter implements AttributeConverter<ItineraryCategory, String> {

    @Override
    public String convertToDatabaseColumn(ItineraryCategory category) {
        return category != null ? category.name() : null;
    }

    @Override
    public ItineraryCategory convertToEntityAttribute(String dbValue) {
        return dbValue != null ? ItineraryCategory.valueOf(dbValue) : null;
    }
}
