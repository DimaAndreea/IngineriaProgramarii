package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.TopUpRequest;
import com.travelquest.travelquestbackend.dto.WalletDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/profile/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<WalletDto> getWallet(@SessionAttribute("user") User user) {
        if (user.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists have wallet");
        }
        BigDecimal balance = walletService.getBalance(user.getId());
        return ResponseEntity.ok(new WalletDto(balance));
    }

    @PostMapping("/topup")
    public ResponseEntity<WalletDto> topUp(@SessionAttribute("user") User user,
                                          @RequestBody TopUpRequest req) {
        if (user.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourists can top up wallet");
        }
        BigDecimal newBalance = walletService.topUp(user.getId(), req.getAmountRon());
        return ResponseEntity.ok(new WalletDto(newBalance));
    }
}
