package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.BuyResponse;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<BuyResponse> buy(@SessionAttribute(value = "user", required = false) User user,
                                          @PathVariable Long itineraryId,
                                          HttpServletRequest request) {
        if (user == null) {
            user = (User) request.getSession().getAttribute("user");
        }
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        BuyResponse resp = walletService.buyItinerary(user.getId(), itineraryId);
        return ResponseEntity.ok(resp);
    }
}
