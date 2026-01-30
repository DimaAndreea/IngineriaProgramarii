package com.travelquest.travelquestbackend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "wallet_transaction")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "tx_type", nullable = false, length = 20)
    private WalletTxType txType;

    @Column(name = "amount_ron", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountRon;

    /**
     * direction: +1 or -1
     */
    @Column(name = "direction", nullable = false)
    private int direction;

    @Column(name = "itinerary_id")
    private Long itineraryId;

    @Column(name = "purchase_id")
    private Long purchaseId;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public WalletTransaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Wallet getWallet() { return wallet; }
    public void setWallet(Wallet wallet) { this.wallet = wallet; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public WalletTxType getTxType() { return txType; }
    public void setTxType(WalletTxType txType) { this.txType = txType; }

    public BigDecimal getAmountRon() { return amountRon; }
    public void setAmountRon(BigDecimal amountRon) { this.amountRon = amountRon; }

    public int getDirection() { return direction; }
    public void setDirection(int direction) { this.direction = direction; }

    public Long getItineraryId() { return itineraryId; }
    public void setItineraryId(Long itineraryId) { this.itineraryId = itineraryId; }

    public Long getPurchaseId() { return purchaseId; }
    public void setPurchaseId(Long purchaseId) { this.purchaseId = purchaseId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
