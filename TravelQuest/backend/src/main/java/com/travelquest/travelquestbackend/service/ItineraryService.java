package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.dto.LocationRequest;
import com.travelquest.travelquestbackend.dto.MissionRequest; // <--- IMPORTUL CARE LIPSEA
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

    // --- CREATE ITINERARY (CASCADED - Versiunea Complexă) ---
    @Transactional
    public Itinerary createItinerary(ItineraryRequest request) {
        User currentUser = getCurrentUser();

        if (request.getItineraryStartDate().isAfter(request.getItineraryEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // 1. Creăm Itinerariul
        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(request.getTitle());
        itinerary.setDescription(request.getDescription());
        itinerary.setCategory(request.getCategory());
        itinerary.setImageUrl(request.getImageUrl());
        itinerary.setPrice(request.getPrice());
        itinerary.setItineraryStartDate(request.getItineraryStartDate());
        itinerary.setItineraryEndDate(request.getItineraryEndDate());
        itinerary.setCreator(currentUser);
        itinerary.setStatus(ItineraryStatus.DRAFT);
        itinerary.setCreatedAt(LocalDateTime.now());

        // 2. Procesăm Locațiile și Misiunile
        if (request.getLocations() != null) {
            for (LocationRequest locReq : request.getLocations()) {
                
                ItineraryLocation location = new ItineraryLocation();
                location.setCountry(locReq.getCountry());
                location.setCity(locReq.getCity());
                location.setOrderIndex(locReq.getOrderIndex());
                
                // Logică pentru a completa câmpul obligatoriu 'objectiveName' din entitate
                String mainObjectiveName = "Visit " + locReq.getCity();
                if (locReq.getObjectives() != null && !locReq.getObjectives().isEmpty()) {
                    mainObjectiveName = locReq.getObjectives().get(0).getDescription();
                }
                location.setObjectiveName(mainObjectiveName);
                
                location.setItinerary(itinerary); 

                // Adăugăm Misiunile
                if (locReq.getObjectives() != null) {
                    for (MissionRequest missReq : locReq.getObjectives()) {
                        ObjectiveMission mission = new ObjectiveMission();
                        mission.setDescription(missReq.getDescription());
                        mission.setRewardXp(missReq.getRewardXp() != null ? missReq.getRewardXp() : 50);
                        
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

    public List<Itinerary> getMyItineraries() {
        User currentUser = getCurrentUser();
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

    // --- LOCATION LOGIC (ACTUALIZATĂ) ---

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
        location.setOrderIndex(request.getOrderIndex());
        
        // FIX: Calculăm objectiveName (deoarece DTO-ul nu îl mai are direct)
        String mainObjectiveName = "Visit " + request.getCity();
        if (request.getObjectives() != null && !request.getObjectives().isEmpty()) {
            mainObjectiveName = request.getObjectives().get(0).getDescription();
        }
        location.setObjectiveName(mainObjectiveName);
        
        location.setItinerary(itinerary);

        // Salvăm locația
        ItineraryLocation savedLocation = locationRepository.save(location);

        // Dacă request-ul are și misiuni, le salvăm și pe ele (opțional, dar util)
        // Notă: Pentru simplitate, aici returnăm doar locația, dar misiunile ar trebui salvate separat 
        // sau gestionate manual aici dacă vrei să le adaugi tot acum.
        
        return savedLocation;
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