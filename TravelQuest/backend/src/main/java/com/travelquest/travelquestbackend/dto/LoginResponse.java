package com.travelquest.travelquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String role;

    // Constructor parțial (custom)
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
