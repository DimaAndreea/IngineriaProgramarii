package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ActiveItinerarySummaryDto;
import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            UserRepository userRepository) {
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE
    // =====================================================
    public Itinerary create(ItineraryRequest req, User creator) {

        if (creator == null) {
            throw new EntityNotFoundException("Creator not found in session");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(LocalDate.parse(req.getStartDate()));
        itinerary.setEndDate(LocalDate.parse(req.getEndDate()));
        itinerary.setStatus(ItineraryStatus.PENDING);
        itinerary.setCreator(creator);

        for (ItineraryRequest.LocationDto locDto : req.getLocations()) {

            ItineraryLocation loc = new ItineraryLocation();
            loc.setItinerary(itinerary);
            loc.setCountry(locDto.getCountry());
            loc.setCity(locDto.getCity());

            for (String objName : locDto.getObjectives()) {
                ItineraryObjective obj = new ItineraryObjective();
                obj.setLocation(loc);
                obj.setName(objName);
                loc.getObjectives().add(obj);
            }

            itinerary.getLocations().add(loc);
        }

        return itineraryRepository.save(itinerary);
    }

    // =====================================================
    // UPDATE
    // =====================================================
    public Itinerary update(Long id, ItineraryRequest req, User loggedUser) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("You cannot edit someone else's itinerary");
        }

        if (itinerary.getStatus() != ItineraryStatus.PENDING) {
            throw new RuntimeException("You cannot edit an itinerary that has been approved or rejected");
        }

        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(LocalDate.parse(req.getStartDate()));
        itinerary.setEndDate(LocalDate.parse(req.getEndDate()));

        itinerary.getLocations().clear();

        for (ItineraryRequest.LocationDto locDto : req.getLocations()) {

            ItineraryLocation loc = new ItineraryLocation();
            loc.setItinerary(itinerary);
            loc.setCountry(locDto.getCountry());
            loc.setCity(locDto.getCity());

            for (String name : locDto.getObjectives()) {
                ItineraryObjective obj = new ItineraryObjective();
                obj.setLocation(loc);
                obj.setName(name);
                loc.getObjectives().add(obj);
            }

            itinerary.getLocations().add(loc);
        }

        return itineraryRepository.save(itinerary);
    }

    // =====================================================
    // DELETE
    // =====================================================
    public void delete(Long id, User loggedUser) {

        Itinerary it = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!it.getCreator().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("You cannot delete someone else's itinerary");
        }

        itineraryRepository.delete(it);
    }

    // =====================================================
    // GET ONE 
    // =====================================================
    public Itinerary getById(Long id) {
        return itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
    }

    // =====================================================
    // OTHER GETTERS
    // =====================================================
    public List<Itinerary> getGuideItineraries(Long guideId) {
        return itineraryRepository.findByCreatorId(guideId);
    }

    public List<Itinerary> getPublic() {
        return itineraryRepository.findByStatus(ItineraryStatus.APPROVED);
    }

    public List<Itinerary> getPending() {
        return itineraryRepository.findByStatus(ItineraryStatus.PENDING);
    }

    // =======================
    // ADMIN — GET ALL
    // =======================
    public List<Itinerary> getAll() {
        return itineraryRepository.findAll();
    }

    public Itinerary approve(Long id) {
        Itinerary it = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        it.setStatus(ItineraryStatus.APPROVED);
        return itineraryRepository.save(it);
    }

    public Itinerary reject(Long id) {
        Itinerary it = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        it.setStatus(ItineraryStatus.REJECTED);
        return itineraryRepository.save(it);
    }

    // =====================================================
    // GUIDE — ACTIVE ITINERARIES
    // =====================================================
    public List<Itinerary> getActiveItinerariesForGuide(User guide) {

        if (guide == null) {
            throw new RuntimeException("User not authenticated.");
        }

        LocalDate today = LocalDate.now(); // poți folosi și cu ZoneId dacă vrei

        return itineraryRepository.findActiveItinerariesForGuide(guide.getId(), today);
    }
}
