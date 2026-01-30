package com.travelquest.travelquestbackend.dto;

import java.math.BigDecimal;

public class WalletDto {

    private BigDecimal balanceRon;

    public WalletDto() {}

    public WalletDto(BigDecimal balanceRon) {
        this.balanceRon = balanceRon;
    }

    public BigDecimal getBalanceRon() { return balanceRon; }
    public void setBalanceRon(BigDecimal balanceRon) { this.balanceRon = balanceRon; }
}
