package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;

import java.time.ZonedDateTime;

@Entity
@Table(
        name = "feedback",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"from_user_id", "itinerary_id"})
        }
)
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long id;

    // =========================
    // cine trimite feedback (TOURIST)
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;

    // =========================
    // cine primește feedback (GUIDE)
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = false)
    private User toUser;

    // =========================
    // itinerariul asociat
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    // =========================
    // rating (1–5)
    // =========================
    @Column(nullable = false)
    private int rating;

    // =========================
    // comentariu (optional)
    // =========================
    @Column(length = 500)
    private String comment;

    // =========================
    // timestamp
    // =========================
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    // =========================
    // CONSTRUCTORS
    // =========================
    public Feedback() {}

    // =========================
    // GETTERS & SETTERS
    // =========================
    public Long getId() {
        return id;
    }

    public User getFromUser() {
        return fromUser;
    }

    public void setFromUser(User fromUser) {
        this.fromUser = fromUser;
    }

    public User getToUser() {
        return toUser;
    }

    public void setToUser(User toUser) {
        this.toUser = toUser;
    }

    public Itinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(Itinerary itinerary) {
        this.itinerary = itinerary;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
