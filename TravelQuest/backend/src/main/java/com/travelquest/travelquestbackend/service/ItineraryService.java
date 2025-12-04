package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.Itinerary;
import com.travelquest.travelquestbackend.model.ItineraryLocation;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItineraryLocationRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final ItineraryLocationRepository itineraryLocationRepository;
    private final UserRepository userRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            ItineraryLocationRepository itineraryLocationRepository,
                            UserRepository userRepository) {
        this.itineraryRepository = itineraryRepository;
        this.itineraryLocationRepository = itineraryLocationRepository;
        this.userRepository = userRepository;
    }

    // -------------------------------------------
    // GET ALL ITINERARIES
    // -------------------------------------------
    public List<Itinerary> getAllItineraries() {
        return itineraryRepository.findAll();
    }

    // -------------------------------------------
    // GET ITINERARY BY ID
    // -------------------------------------------
    public Optional<Itinerary> getItineraryById(Long id) {
        return itineraryRepository.findById(id);
    }

    // -------------------------------------------
    // CREATE A NEW ITINERARY
    // -------------------------------------------
    public Itinerary createItinerary(Itinerary itinerary, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        itinerary.setUser(user); // assign creator
        return itineraryRepository.save(itinerary);
    }

    // -------------------------------------------
    // ADD LOCATION TO ITINERARY
    // -------------------------------------------
    public ItineraryLocation addLocation(Long itineraryId, ItineraryLocation location) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        location.setItinerary(itinerary);
        return itineraryLocationRepository.save(location);
    }

    // -------------------------------------------
    // GET LOCATIONS FOR ITINERARY
    // -------------------------------------------
    public List<ItineraryLocation> getLocationsByItinerary(Long itineraryId) {
        return itineraryLocationRepository.findByItineraryId(itineraryId);
    }

    // -------------------------------------------
    // DELETE ITINERARY
    // -------------------------------------------
    public void deleteItinerary(Long id, Long userId) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));

        // Only the owner or an admin can delete
        if (!itinerary.getUser().getId().equals(userId)
                && !itinerary.getUser().getRole().equals(UserRole.ADMIN)) {
            throw new RuntimeException("Not authorized to delete this itinerary");
        }

        itineraryRepository.delete(itinerary);
    }
}