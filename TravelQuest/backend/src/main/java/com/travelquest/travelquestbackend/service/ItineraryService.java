package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;

    public ItineraryService(ItineraryRepository itineraryRepository, UserRepository userRepository) {
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
    }

    // ============================
    // CREATE
    // ============================
    public Itinerary create(ItineraryRequest req) {

        User creator = userRepository.findById(req.getGuideId())
                .orElseThrow(() -> new EntityNotFoundException("Guide not found"));

        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(LocalDate.parse(req.getStartDate()));
        itinerary.setEndDate(LocalDate.parse(req.getEndDate()));

        // IMPORTANT!!!
        if (req.getStatus() == null) {
            itinerary.setStatus(ItineraryStatus.PENDING);
        } else {
            itinerary.setStatus(req.getStatus());
        }

        itinerary.setCreator(creator);

        // LOCATIONS
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

    // ============================
    // UPDATE
    // ============================
    public Itinerary update(Long id, ItineraryRequest req) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(LocalDate.parse(req.getStartDate()));
        itinerary.setEndDate(LocalDate.parse(req.getEndDate()));

        // Replace locations
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

    public void delete(Long id) {
        if (!itineraryRepository.existsById(id))
            throw new EntityNotFoundException("Itinerary not found");
        itineraryRepository.deleteById(id);
    }

    public List<Itinerary> getGuideItineraries(Long guideId) {
        return itineraryRepository.findByCreatorId(guideId);
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

    public List<Itinerary> getPublic() {
        return itineraryRepository.findByStatus(ItineraryStatus.APPROVED);
    }

    public List<Itinerary> getPending() {
        return itineraryRepository.findByStatus(ItineraryStatus.PENDING);
    }
}
