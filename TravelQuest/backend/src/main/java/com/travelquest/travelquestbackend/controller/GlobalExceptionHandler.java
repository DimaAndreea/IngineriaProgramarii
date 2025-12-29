package com.travelquest.travelquestbackend.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MethodArgumentNotValidException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        System.out.println("=== VALIDATION FAILED ===");
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            System.out.println("Field: " + error.getField() + ", rejected value: " + error.getRejectedValue());
        });
        System.out.println("========================");
        return ResponseEntity.badRequest().body("Validation failed");
    }
}
