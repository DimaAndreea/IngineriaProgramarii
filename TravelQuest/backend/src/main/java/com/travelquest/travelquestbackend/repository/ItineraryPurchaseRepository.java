package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.ItineraryPurchase;
import com.travelquest.travelquestbackend.model.PurchaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItineraryPurchaseRepository extends JpaRepository<ItineraryPurchase, Long> {

    Optional<ItineraryPurchase> findByTouristIdAndItineraryId(Long touristId, Long itineraryId);

    boolean existsByTouristIdAndItineraryIdAndStatus(Long touristId, Long itineraryId, PurchaseStatus status);
}
