package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.BuyResponse;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryPurchaseController {

    private final WalletService walletService;

    public ItineraryPurchaseController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/{itineraryId}/buy")
    public ResponseEntity<BuyResponse> buy(@SessionAttribute("user") User user,
                                          @PathVariable Long itineraryId) {
        BuyResponse resp = walletService.buyItinerary(user.getId(), itineraryId);
        return ResponseEntity.ok(resp);
    }
}
