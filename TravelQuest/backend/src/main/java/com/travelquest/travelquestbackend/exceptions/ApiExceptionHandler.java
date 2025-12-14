package com.travelquest.travelquestbackend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionHandler {

    public record ApiError(String message, int status, Instant timestamp) {}

    @ExceptionHandler(ItineraryOverlapException.class)
    public ResponseEntity<ApiError> handleOverlap(ItineraryOverlapException ex) {
        // 409 Conflict
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(ex.getMessage(), HttpStatus.CONFLICT.value(), Instant.now()));
    }
}