package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ItineraryFilter;
import com.travelquest.travelquestbackend.model.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ItineraryService_Filter_Sort {

    @PersistenceContext
    private EntityManager em;

    // =======================
    // FILTER + SORT
    // =======================
    public List<Itinerary> filter(ItineraryFilter filterDTO, User loggedUser) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Itinerary> cq = cb.createQuery(Itinerary.class);
        Root<Itinerary> root = cq.from(Itinerary.class);
        List<Predicate> predicates = new ArrayList<>();

        // --------------------------
        // ROLE BASED ACCESS
        // --------------------------
        if (loggedUser.getRole() == UserRole.GUIDE) {
            // guide can see: own itineraries + approved itineraries of others
            Predicate own = cb.equal(root.get("creator").get("id"), loggedUser.getId());
            Predicate approved = cb.equal(root.get("status"), ItineraryStatus.APPROVED);
            predicates.add(cb.or(own, approved));
        } else if (loggedUser.getRole() == UserRole.ADMIN) {
            // admin can see all → no predicate needed
        } else { // TOURIST
            predicates.add(cb.equal(root.get("status"), ItineraryStatus.APPROVED));
        }

        // --------------------------
        // GLOBAL SEARCH
        // --------------------------
        if (filterDTO.searchGlobal != null && !filterDTO.searchGlobal.trim().isEmpty()) {
            String term = "%" + filterDTO.searchGlobal.trim().toLowerCase() + "%";
            Predicate titleMatch = cb.like(cb.lower(root.get("title")), term);
            Predicate creatorMatch = cb.like(cb.lower(root.get("creator").get("username")), term);

            // location join
            Join<Itinerary, ItineraryLocation> locJoin = root.join("locations", JoinType.LEFT);
            Predicate countryMatch = cb.like(cb.lower(locJoin.get("country")), term);
            Predicate cityMatch = cb.like(cb.lower(locJoin.get("city")), term);

            predicates.add(cb.or(titleMatch, creatorMatch, countryMatch, cityMatch));
        }

        // --------------------------
        // DATE RANGE
        // --------------------------
        if (filterDTO.dates != null) {
            String startFrom = filterDTO.dates.get("startFrom");
            String startTo = filterDTO.dates.get("startTo");
            if (startFrom != null && !startFrom.isEmpty()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), LocalDate.parse(startFrom)));
            }
            if (startTo != null && !startTo.isEmpty()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), LocalDate.parse(startTo)));
            }
        }

        // --------------------------
        // PRICE RANGE
        // --------------------------
        if (filterDTO.price != null) {
            Integer min = filterDTO.price.get("min");
            Integer max = filterDTO.price.get("max");
            if (min != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), min));
            if (max != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), max));
        }

        // --------------------------
        // CATEGORY TYPE
        // --------------------------
        if (filterDTO.category != null && filterDTO.category.values().stream().anyMatch(Boolean::booleanValue)) {
            List<Predicate> catPreds = new ArrayList<>();
            filterDTO.category.forEach((catName, selected) -> {
                if (Boolean.TRUE.equals(selected)) {
                    catPreds.add(cb.equal(cb.lower(root.get("category")), catName.toLowerCase()));
                }
            });
            predicates.add(cb.or(catPreds.toArray(new Predicate[0])));
        }

        // --------------------------
        // FILTER BY GUIDE
        // --------------------------
        if (filterDTO.guideId != null) {
            predicates.add(cb.equal(root.get("creator").get("id"), filterDTO.guideId));
        }

        // --------------------------
        // RATING
        // --------------------------
        if (filterDTO.rating != null && !filterDTO.rating.isEmpty()) {
            try {
                Integer minRating = Integer.parseInt(filterDTO.rating);
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            } catch (NumberFormatException ignored) {}
        }

        // --------------------------
        // APPLY PREDICATES
        // --------------------------
        cq.where(cb.and(predicates.toArray(new Predicate[0])));

        // --------------------------
        // SORT
        // --------------------------
        if ("priceAsc".equals(filterDTO.sort)) {
            cq.orderBy(cb.asc(root.get("price")));
        } else if ("priceDesc".equals(filterDTO.sort)) {
            cq.orderBy(cb.desc(root.get("price")));
        }

        TypedQuery<Itinerary> query = em.createQuery(cq.distinct(true));
        return query.getResultList();
    }
}
