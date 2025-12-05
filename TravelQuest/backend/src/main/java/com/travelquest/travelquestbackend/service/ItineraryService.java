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

    // --- FIX USER LOOKUP ---
    // Această metodă rezolvă eroarea "User not found"
    private User getCurrentUser() {
        // Obținem identitatea din contextul de securitate (poate fi email sau username)
        String authName = SecurityContextHolder.getContext().getAuthentication().getName();
        
        System.out.println(">>> DEBUG: Caut userul conectat: " + authName);

        // Folosim metoda ta existentă care caută în ambele coloane
        // Îi dăm 'authName' la ambele argumente: "Caută string-ul X în email SAU în username"
        return userRepository.findByEmailOrUsername(authName, authName)
                .orElseThrow(() -> new RuntimeException("User not found: " + authName));
    }
    // --- CREATE ITINERARY ---
    @Transactional
    public Itinerary createItinerary(ItineraryRequest request) {
        User currentUser = getCurrentUser();

        // Validare dată
        if (request.getItineraryStartDate().isAfter(request.getItineraryEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setCategory(request.getCategory());
        
        // Imaginea Base64
        itinerary.setImage(request.getImage());
        
        itinerary.setPrice(request.getPrice());
        itinerary.setItineraryStartDate(request.getItineraryStartDate());
        itinerary.setItineraryEndDate(request.getItineraryEndDate());
        
        // AICI SE FOLOSEȘTE USERUL GĂSIT CORECT
        itinerary.setCreator(currentUser);
        
        itinerary.setStatus(ItineraryStatus.DRAFT);
        // CreatedAt e automat

        // Procesare Locații și Obiective (Lista de String-uri)
        if (request.getLocations() != null) {
            for (LocationRequest locReq : request.getLocations()) {
                ItineraryLocation location = new ItineraryLocation();
                location.setCountry(locReq.getCountry());
                location.setCity(locReq.getCity());
                location.setOrderIndex(locReq.getOrderIndex());
                
                // Setăm numele obiectivului principal
                String mainObj = "Visit " + locReq.getCity();
                if (locReq.getObjectives() != null && !locReq.getObjectives().isEmpty()) {
                    mainObj = locReq.getObjectives().get(0); 
                }
                location.setObjectiveName(mainObj);
                
                location.setItinerary(itinerary); 

                // Adăugăm Misiunile (STRING-uri)
                if (locReq.getObjectives() != null) {
                    for (String objectiveDesc : locReq.getObjectives()) {
                        ObjectiveMission mission = new ObjectiveMission();
                        mission.setDescription(objectiveDesc);
                        mission.setRewardXp(50); 
                        mission.setLocation(location);
                        mission.setItinerary(itinerary); 
                        itinerary.getMissions().add(mission);
                    }
                }
                itinerary.getLocations().add(location);
            }
        }

        return itineraryRepository.save(itinerary);
    }

    // --- GET MY ITINERARIES ---
    public List<Itinerary> getMyItineraries() {
        return itineraryRepository.findByCreator(getCurrentUser());
    }

    // --- UPDATE ITINERARY ---
    @Transactional
    public Itinerary updateItinerary(Long id, ItineraryRequest request) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        
        // Verificare Proprietar folosind getUserId()
        if (!itinerary.getCreator().getUserId().equals(getCurrentUser().getUserId())) {
             throw new RuntimeException("Access denied: You are not the owner");
        }

        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setCategory(request.getCategory());
        itinerary.setImage(request.getImage());
        itinerary.setPrice(request.getPrice());
        itinerary.setItineraryStartDate(request.getItineraryStartDate());
        itinerary.setItineraryEndDate(request.getItineraryEndDate());

        return itineraryRepository.save(itinerary);
    }

    // --- DELETE ITINERARY ---
    public void deleteItinerary(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        if (!itinerary.getCreator().getUserId().equals(getCurrentUser().getUserId())) {
            throw new RuntimeException("Access denied");
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
            throw new RuntimeException("Access denied");
        }

        ItineraryLocation location = new ItineraryLocation();
        location.setCountry(request.getCountry());
        location.setCity(request.getCity());
        location.setOrderIndex(request.getOrderIndex());
        
        String mainObj = "Visit " + request.getCity();
        if (request.getObjectives() != null && !request.getObjectives().isEmpty()) {
            mainObj = request.getObjectives().get(0);
        }
        location.setObjectiveName(mainObj);
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
             throw new RuntimeException("Access denied");
        }
        locationRepository.delete(location);
    }
}