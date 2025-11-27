package com.travelquest.travelquestbackend.model;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/*******************************************************
 * Converter pentru UserRole
 *
 * Rol:
 * - Converteste enum-ul UserRole in String pentru baza de date.
 * - Converteste String din baza de date inapoi in enum UserRole.
 *
 * AutoApply = true -> se aplica automat pentru toate campurile UserRole
 *******************************************************/

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public UserRole convertToEntityAttribute(String dbData) {
        return dbData != null ? UserRole.valueOf(dbData) : null;
    }
}
