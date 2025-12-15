package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.UserRole;

public class UserProfileDto {

    private Long id;
    private String username;
    private String email;
    private String phone;
    private UserRole role;
//
    public UserProfileDto(Long id, String username, String email, String phone, UserRole role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public UserRole getRole() { return role; }
}
