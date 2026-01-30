package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "itinerary_purchase",
        uniqueConstraints = @UniqueConstraint(name = "uq_purchase_once_per_itinerary",
                columnNames = {"tourist_id", "itinerary_id"}))
public class ItineraryPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tourist_id", nullable = false)
    private User tourist;

    @Column(name = "amount_ron", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountRon;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "RON";

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    @ColumnTransformer(write = "?::purchase_status")
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "paid_at")
    private ZonedDateTime paidAt;

    @ManyToOne
    @JoinColumn(name = "wallet_tx_id")
    private WalletTransaction walletTransaction;

    public ItineraryPurchase() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }

    public User getTourist() { return tourist; }
    public void setTourist(User tourist) { this.tourist = tourist; }

    public BigDecimal getAmountRon() { return amountRon; }
    public void setAmountRon(BigDecimal amountRon) { this.amountRon = amountRon; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PurchaseStatus getStatus() { return status; }
    public void setStatus(PurchaseStatus status) { this.status = status; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public ZonedDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(ZonedDateTime paidAt) { this.paidAt = paidAt; }

    public WalletTransaction getWalletTransaction() { return walletTransaction; }
    public void setWalletTransaction(WalletTransaction walletTransaction) { this.walletTransaction = walletTransaction; }
}
