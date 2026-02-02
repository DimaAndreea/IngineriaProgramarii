package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.BuyResponse;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ItineraryPurchaseRepository itineraryPurchaseRepository;
    private final ItineraryParticipantRepository itineraryParticipantRepository;
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public WalletService(WalletRepository walletRepository,
                         WalletTransactionRepository walletTransactionRepository,
                         ItineraryPurchaseRepository itineraryPurchaseRepository,
                         ItineraryParticipantRepository itineraryParticipantRepository,
                         ItineraryRepository itineraryRepository,
                         UserRepository userRepository,
                         PointsService pointsService) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.itineraryPurchaseRepository = itineraryPurchaseRepository;
        this.itineraryParticipantRepository = itineraryParticipantRepository;
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            User u = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            Wallet w = new Wallet();
            w.setUser(u);
            w.setBalanceRon(BigDecimal.ZERO);
            w.setUpdatedAt(ZonedDateTime.now());
            return walletRepository.save(w);
        });
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(Wallet::getBalanceRon)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Simulated top-up: user types amount, we pretend card payment succeeded.
     */
    @Transactional
    public BigDecimal topUp(Long userId, BigDecimal amountRon) {
        if (amountRon == null || amountRon.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Top-up amount must be > 0");
        }

        Wallet wallet = getOrCreateWallet(userId);

        wallet.setBalanceRon(wallet.getBalanceRon().add(amountRon));
        wallet.setUpdatedAt(ZonedDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setUser(wallet.getUser());
        tx.setTxType(WalletTxType.TOPUP);
        tx.setAmountRon(amountRon);
        tx.setDirection(1);
        tx.setDescription("Top-up (simulated card)");
        walletTransactionRepository.save(tx);

        return wallet.getBalanceRon();
    }

    /**
     * Buy + join (atomic).
     * If already PAID -> idempotent success.
     */
    @Transactional
    public BuyResponse buyItinerary(Long touristId, Long itineraryId) {

        User tourist = userRepository.findById(touristId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can buy itineraries");
        }

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (itinerary.getStatus() != ItineraryStatus.APPROVED) {
            throw new RuntimeException("Cannot buy a non-approved itinerary");
        }

        BigDecimal price = BigDecimal.valueOf(itinerary.getPrice()).setScale(2);
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("This itinerary has invalid price");
        }

        // If already paid, ensure joined and return ok (idempotent)
        boolean alreadyPaid = itineraryPurchaseRepository
                .existsByTouristIdAndItineraryIdAndStatus(touristId, itineraryId, PurchaseStatus.PAID);

        if (alreadyPaid) {
            boolean alreadyJoined = itineraryParticipantRepository.existsByItineraryAndTourist(itinerary, touristId);
            if (!alreadyJoined) {
                ItineraryParticipant p = new ItineraryParticipant();
                p.setItinerary(itinerary);
                p.setTourist(tourist);
                p.setJoinedAt(ZonedDateTime.now());
                itineraryParticipantRepository.save(p);
                
                // Award XP to guide when tourist joins
                User guide = itinerary.getCreator();
                if (guide != null && guide.getRole() == UserRole.GUIDE) {
                    pointsService.addPointsForItineraryJoinedGuide(guide.getId(), itinerary.getId());
                }
            }
            BigDecimal bal = getBalance(touristId);
            return new BuyResponse("Payment already completed. You are enrolled.", bal);
        }

        Wallet wallet = getOrCreateWallet(touristId);

        if (wallet.getBalanceRon().compareTo(price) < 0) {
            throw new RuntimeException("Insufficient funds! Please add funds.");
        }

        // Create purchase PENDING first
        ItineraryPurchase purchase = itineraryPurchaseRepository
                .findByTouristIdAndItineraryId(touristId, itineraryId)
                .orElseGet(() -> {
                    ItineraryPurchase p = new ItineraryPurchase();
                    p.setItinerary(itinerary);
                    p.setTourist(tourist);
                    p.setAmountRon(price);
                    p.setCurrency("RON");
                    p.setStatus(PurchaseStatus.PENDING);
                    p.setCreatedAt(ZonedDateTime.now());
                    return p;
                });

        purchase.setAmountRon(price);
        purchase.setStatus(PurchaseStatus.PENDING);
        itineraryPurchaseRepository.save(purchase);

        // Deduct balance
        wallet.setBalanceRon(wallet.getBalanceRon().subtract(price));
        wallet.setUpdatedAt(ZonedDateTime.now());
        walletRepository.save(wallet);

        // Wallet tx (purchase)
        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setUser(tourist);
        tx.setTxType(WalletTxType.PURCHASE);
        tx.setAmountRon(price);
        tx.setDirection(-1);
        tx.setItineraryId(itineraryId);
        tx.setDescription("Itinerary purchase");
        walletTransactionRepository.save(tx);

        // Mark purchase paid
        purchase.setStatus(PurchaseStatus.PAID);
        purchase.setPaidAt(ZonedDateTime.now());
        purchase.setWalletTransaction(tx);
        itineraryPurchaseRepository.save(purchase);

        // link tx -> purchase id (optional)
        tx.setPurchaseId(purchase.getId());
        walletTransactionRepository.save(tx);

        // join
        boolean alreadyJoined = itineraryParticipantRepository.existsByItineraryAndTourist(itinerary, touristId);
        if (!alreadyJoined) {
            ItineraryParticipant participant = new ItineraryParticipant();
            participant.setItinerary(itinerary);
            participant.setTourist(tourist);
            participant.setJoinedAt(ZonedDateTime.now());
            itineraryParticipantRepository.save(participant);
            
            // Award XP to guide when tourist joins
            User guide = itinerary.getCreator();
            if (guide != null && guide.getRole() == UserRole.GUIDE) {
                pointsService.addPointsForItineraryJoinedGuide(guide.getId(), itinerary.getId());
            }
        }

        return new BuyResponse("Payment successful! ✅", wallet.getBalanceRon());
    }
}
