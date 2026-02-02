package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.UserRole;

import java.util.List;
import com.travelquest.travelquestbackend.dto.MyBadgeDto;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private UserRole role;
    private List<MyBadgeDto> badges;

    public UserProfileDto(Long id, String username, String email, String phone, UserRole role, List<MyBadgeDto> badges) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.badges = badges;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public UserRole getRole() { return role; }
    public List<MyBadgeDto> getBadges() { return badges; }
    public void setBadges(List<MyBadgeDto> badges) { this.badges = badges; }
}
