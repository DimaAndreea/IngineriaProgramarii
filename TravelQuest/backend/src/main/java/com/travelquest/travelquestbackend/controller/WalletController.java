package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.TopUpRequest;
import com.travelquest.travelquestbackend.dto.WalletDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<WalletDto> getWallet(@SessionAttribute(value = "user", required = false) User user,
                                               HttpServletRequest request) {
        if (user == null) {
            user = (User) request.getSession().getAttribute("user");
        }

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        if (user.getRole() != UserRole.TOURIST) {
            return ResponseEntity.status(403).build();
        }

        BigDecimal balance = walletService.getBalance(user.getId());
        return ResponseEntity.ok(new WalletDto(balance));
    }

    @PostMapping("/topup")
    public ResponseEntity<WalletDto> topUp(@SessionAttribute(value = "user", required = false) User user,
                                           @RequestBody TopUpRequest req,
                                           HttpServletRequest request) {
        if (user == null) {
            user = (User) request.getSession().getAttribute("user");
        }

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        if (user.getRole() != UserRole.TOURIST) {
            return ResponseEntity.status(403).build();
        }

        if (req == null || req.getAmountRon() == null) {
            return ResponseEntity.badRequest().build();
        }

        BigDecimal newBalance = walletService.topUp(user.getId(), req.getAmountRon());
        return ResponseEntity.ok(new WalletDto(newBalance));
    }
}
