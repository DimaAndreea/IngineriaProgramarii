package com.travelquest.travelquestbackend.dto;

import java.math.BigDecimal;

public class TopUpRequest {

    private BigDecimal amountRon;

    public TopUpRequest() {}

    public BigDecimal getAmountRon() { return amountRon; }
    public void setAmountRon(BigDecimal amountRon) { this.amountRon = amountRon; }
}
