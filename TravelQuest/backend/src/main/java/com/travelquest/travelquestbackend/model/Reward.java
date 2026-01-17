package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "mission_rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_id")
    private Long id;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    @Column(name = "real_reward_title")
    private String title;

    @Column(name = "real_reward_description", columnDefinition = "TEXT")
    private String description;

    // Relația corectă cu Mission
    // JsonBackReference evită loop-ul infinit la serializare
    @OneToOne
    @JoinColumn(name = "mission_id", nullable = false)
    @JsonBackReference
    private Mission mission;

    // =========================
    // Getters & Setters
    // =========================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getXpReward() {
        return xpReward;
    }

    public void setXpReward(int xpReward) {
        this.xpReward = xpReward;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }
}
