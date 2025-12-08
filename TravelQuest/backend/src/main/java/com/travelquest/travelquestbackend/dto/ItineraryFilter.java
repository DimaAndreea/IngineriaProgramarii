package com.travelquest.travelquestbackend.dto;
import java.util.Map;

public class ItineraryFilter {
    public Map<String, Boolean> categories; /// all, mine, approved, pending, rejected, others
    public Map<String, String> dates;       /// startFrom, startTo
    public Map<String, Integer> price;      /// min, max
    public Map<String, Boolean> category;   /// cultural, adventure, etc.
    public String sort;                     /// none, priceAsc, priceDesc
    public String rating;                   /// 1-5
    public String searchGlobal;             /// search term
    public Long guideId;                    /// filter by guide ID
}
