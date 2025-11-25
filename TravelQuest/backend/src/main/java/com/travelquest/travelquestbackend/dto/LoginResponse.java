package com.travelquest.travelquestbackend.dto;

///  ca sa nu mai scriu constructori, getter si setter manuali folosesc lombok
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String message;

    // Constructor cu argumente
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getter pentru boolean
    public boolean isSuccess() {
        return success;
    }

    // Getter pentru message
    public String getMessage() {
        return message;
    }

    // Optional: setter dacă ai nevoie
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
