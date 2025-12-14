package com.travelquest.travelquestbackend.model;

import java.time.ZonedDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    ///@Enumerated(EnumType.STRING)
    @Convert(converter = UserRoleConverter.class)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private int xp = 0;

    @Column(name = "travel_coins")
    private int travelCoins;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    //USER <-> BADGE (prin USER_BADGE)
    @ManyToOne
    @JoinColumn(name = "selected_badge_id")
    private Badge selectedBadge;

    public User() {
    }

    public User(Long id, UserRole role, String username, String passwordHash,
                String phoneNumber, String email, int level, int xp, int travelCoins) {
        this.id = id;
        this.role = role;
        this.username = username;
        this.passwordHash = passwordHash;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.level = level;
        this.xp = xp;
        this.travelCoins = travelCoins;
    }

    /// GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getTravelCoins() {
        return travelCoins;
    }

    public void setTravelCoins(int travelCoins) {
        this.travelCoins = travelCoins;
    }

    public Badge getSelectedBadge() { 
        return selectedBadge; 
    }

    public void setSelectedBadge(Badge selectedBadge) { 
        this.selectedBadge = selectedBadge; 
    }
}
