package com.travelquest.travelquestbackend.dto;

import java.math.BigDecimal;

public class BuyResponse {

    private String message;
    private BigDecimal newBalanceRon;

    public BuyResponse() {}

    public BuyResponse(String message, BigDecimal newBalanceRon) {
        this.message = message;
        this.newBalanceRon = newBalanceRon;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BigDecimal getNewBalanceRon() { return newBalanceRon; }
    public void setNewBalanceRon(BigDecimal newBalanceRon) { this.newBalanceRon = newBalanceRon; }
}
