package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.dto.LocationRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryLocationRepository;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItineraryLocationRepository locationRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- ITINERARY CRUD ---

    public Itinerary createItinerary(ItineraryRequest request) {
        User currentUser = getCurrentUser();

        if (request.getItineraryStartDate().isAfter(request.getItineraryEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setCategory(request.getCategory());
        itinerary.setImageUrl(request.getImageUrl());
        itinerary.setPrice(request.getPrice());
        itinerary.setItineraryStartDate(request.getItineraryStartDate());
        itinerary.setItineraryEndDate(request.getItineraryEndDate());
        
        itinerary.setCreator(currentUser); // Folosește setCreator din noul Itinerary.java
        itinerary.setStatus(ItineraryStatus.DRAFT);
        
        return itineraryRepository.save(itinerary);
    }

    public List<Itinerary> getMyItineraries() {
        User currentUser = getCurrentUser();
        // Asigură-te că ItineraryRepository are metoda findByCreator(User creator)
        return itineraryRepository.findByCreator(currentUser);
    }

    @Transactional
    public Itinerary updateItinerary(Long id, ItineraryRequest request) {
        User currentUser = getCurrentUser();
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getCreator().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied: You are not the owner of this itinerary");
        }

        if (request.getItineraryStartDate().isAfter(request.getItineraryEndDate())) {
             throw new IllegalArgumentException("Start date cannot be after end date");
        }

        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setCategory(request.getCategory());
        itinerary.setImageUrl(request.getImageUrl());
        itinerary.setPrice(request.getPrice());
        itinerary.setItineraryStartDate(request.getItineraryStartDate());
        itinerary.setItineraryEndDate(request.getItineraryEndDate());

        return itineraryRepository.save(itinerary);
    }

    public void deleteItinerary(Long id) {
        User currentUser = getCurrentUser();
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getCreator().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied: You are not the owner");
        }

        itineraryRepository.delete(itinerary);
    }

    // --- LOCATION LOGIC ---

    @Transactional
    public ItineraryLocation addLocation(Long itineraryId, LocationRequest request) {
        User currentUser = getCurrentUser();
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getCreator().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access denied: You do not own this itinerary");
        }

        ItineraryLocation location = new ItineraryLocation();
        location.setCountry(request.getCountry());
        location.setCity(request.getCity());
        location.setObjectiveName(request.getObjectiveName());
        location.setOrderIndex(request.getOrderIndex());
        location.setItinerary(itinerary);

        return locationRepository.save(location);
    }

    public List<ItineraryLocation> getLocations(Long itineraryId) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        return locationRepository.findByItineraryOrderByOrderIndexAsc(itinerary);
    }

    public void deleteLocation(Long locationId) {
        User currentUser = getCurrentUser();
        ItineraryLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (!location.getItinerary().getCreator().getUserId().equals(currentUser.getUserId())) {
             throw new RuntimeException("Access denied: You do not own this itinerary");
        }
        locationRepository.delete(location);
    }
}