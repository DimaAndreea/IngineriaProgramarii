package com.travelquest.travelquestbackend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterRequest {
    private String username;
    private String email;

    private String phoneNumber;

    private String password;
    private String role; /// "ADMIN", "GUIDE", "TOURIST"

    private String adminCode; /// Optional field for admin registration

    public RegisterRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAdminCode() {
        return adminCode;
    }
    public void setAdminCode(String adminCode) {
        this.adminCode = adminCode;
    }
}
