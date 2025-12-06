package com.travelquest.travelquestbackend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ItineraryStatusConverter implements AttributeConverter<ItineraryStatus, String> {

    @Override
    public String convertToDatabaseColumn(ItineraryStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public ItineraryStatus convertToEntityAttribute(String dbData) {
        return dbData != null ? ItineraryStatus.valueOf(dbData) : null;
    }
}
