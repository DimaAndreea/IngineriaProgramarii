package com.travelquest.travelquestbackend.exceptions;

public class ItineraryOverlapException extends RuntimeException {
    public ItineraryOverlapException(String message) {
        super(message);
    }
}