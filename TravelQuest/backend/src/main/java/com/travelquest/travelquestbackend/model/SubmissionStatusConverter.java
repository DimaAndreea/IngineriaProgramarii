package com.travelquest.travelquestbackend.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class SubmissionStatusConverter implements AttributeConverter<SubmissionStatus, String> {

    @Override
    public String convertToDatabaseColumn(SubmissionStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public SubmissionStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : SubmissionStatus.valueOf(dbData);
    }
}