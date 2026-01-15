package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_level_history")
public class UserLevelHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_history_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "old_level", nullable = false)
    private int oldLevel;

    @Column(name = "new_level", nullable = false)
    private int newLevel;

    @Column(name = "changed_at")
    private ZonedDateTime changedAt = ZonedDateTime.now();

    @Column(name = "reason", length = 50)
    private String reason;

    public UserLevelHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getOldLevel() { return oldLevel; }
    public void setOldLevel(int oldLevel) { this.oldLevel = oldLevel; }

    public int getNewLevel() { return newLevel; }
    public void setNewLevel(int newLevel) { this.newLevel = newLevel; }

    public ZonedDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(ZonedDateTime changedAt) { this.changedAt = changedAt; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
