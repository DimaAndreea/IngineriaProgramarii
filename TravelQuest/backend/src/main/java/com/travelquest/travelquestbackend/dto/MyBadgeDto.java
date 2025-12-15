package com.travelquest.travelquestbackend.dto;

import com.travelquest.travelquestbackend.model.UserRole;

import java.time.ZonedDateTime;

public class MyBadgeDto {

    private Long id;
    private String code;
    private String name;
    private String description;
    private int minLevel;
    private UserRole role;

    private boolean unlocked;
    private boolean selected;
    private ZonedDateTime awardedAt; // null dacă locked

    public MyBadgeDto() {}

    public MyBadgeDto(Long id, String code, String name, String description, int minLevel, UserRole role,
                      boolean unlocked, boolean selected, ZonedDateTime awardedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.minLevel = minLevel;
        this.role = role;
        this.unlocked = unlocked;
        this.selected = selected;
        this.awardedAt = awardedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getMinLevel() { return minLevel; }
    public void setMinLevel(int minLevel) { this.minLevel = minLevel; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }

    public boolean isSelected() { return selected; }
    public void setSelected(boolean selected) { this.selected = selected; }

    public ZonedDateTime getAwardedAt() { return awardedAt; }
    public void setAwardedAt(ZonedDateTime awardedAt) { this.awardedAt = awardedAt; }
}
