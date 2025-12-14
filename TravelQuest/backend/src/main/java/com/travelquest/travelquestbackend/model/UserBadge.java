package com.travelquest.travelquestbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.ZonedDateTime;

@Entity
@Table(
        name = "user_badge",
        uniqueConstraints = @UniqueConstraint(name = "uq_user_badge", columnNames = {"user_id", "badge_id"})
)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_badge_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "awarded_at", nullable = false)
    private ZonedDateTime awardedAt = ZonedDateTime.now();

    public UserBadge() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public Badge getBadge() { return badge; }

    public void setBadge(Badge badge) { this.badge = badge; }

    public ZonedDateTime getAwardedAt() { return awardedAt; }

    public void setAwardedAt(ZonedDateTime awardedAt) { this.awardedAt = awardedAt; }
}
