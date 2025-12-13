package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryParticipantRepository itineraryParticipantRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            UserRepository userRepository,
                            ItineraryParticipantRepository itineraryParticipantRepository) {
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
        this.itineraryParticipantRepository = itineraryParticipantRepository;
    }

    // =====================================================
    // CREATE
    // =====================================================
    public Itinerary create(ItineraryRequest req, User creator) {

        if (creator == null) {
            throw new EntityNotFoundException("Creator not found in session");
        }

        // 1. Parsăm datele și verificăm că intervalul e valid
        LocalDate startDate = LocalDate.parse(req.getStartDate());
        LocalDate endDate = LocalDate.parse(req.getEndDate());

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

        // 2. Verificăm dacă ghidul are deja un itinerariu care se suprapune
        boolean overlaps = itineraryRepository.existsOverlappingItineraryForGuide(
                creator.getId(),
                startDate,
                endDate
        );

        if (overlaps) {
            throw new RuntimeException("You already have another itinerary in this time interval.");
        }

        // 3. Creăm itinerariul doar dacă nu există suprapuneri
        Itinerary itinerary = new Itinerary();
        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(startDate);
        itinerary.setEndDate(endDate);
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

        LocalDate startDate = LocalDate.parse(req.getStartDate());
        LocalDate endDate = LocalDate.parse(req.getEndDate());

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

        // verificăm suprapunerea cu ALTE itinerarii ale aceluiași ghid
        boolean overlaps = itineraryRepository.existsOverlappingItineraryForGuideExcludingItinerary(
                loggedUser.getId(),
                id,
                startDate,
                endDate
        );

        if (overlaps) {
            throw new RuntimeException("You already have another itinerary in this time interval.");
        }

        itinerary.setTitle(req.getTitle());
        itinerary.setDescription(req.getDescription());
        itinerary.setCategory(req.getCategory());
        itinerary.setPrice(req.getPrice());
        itinerary.setImageBase64(req.getImageBase64());
        itinerary.setStartDate(startDate);
        itinerary.setEndDate(endDate);

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
    // DELETE ITINERARY
    // =====================================================
    public void delete(Long id, User loggedUser) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("You cannot delete someone else's itinerary");
        }

        itineraryRepository.delete(itinerary);
    }

    // =====================================================
    // TOURIST — JOIN ITINERARY
    // =====================================================
    public String joinItinerary(Long itineraryId, User user) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (itinerary.getStatus() != ItineraryStatus.APPROVED) {
            throw new RuntimeException("Cannot join a non-approved itinerary");
        }

        if (user.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourist users can join an itinerary");
        }

        boolean alreadyJoined = itineraryParticipantRepository.existsByItineraryAndTourist(itinerary, user.getId());
        if (alreadyJoined) {
            throw new RuntimeException("You already joined this itinerary");
        }

        ItineraryParticipant participant = new ItineraryParticipant();
        participant.setItinerary(itinerary);
        participant.setTourist(user);
        participant.setJoinedAt(ZonedDateTime.now());

        itineraryParticipantRepository.save(participant);

        return "TOUR JOINED! Welcome to the adventure, " + user.getUsername() + " 🎉";
    }

    // =====================================================
    // GET ITINERARY BY ID
    // =====================================================
    public Itinerary getById(Long id) {
        return itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
    }

    // =====================================================
    // GET ACTIVE ITINERARY FOR TOURIST
    // =====================================================
    public Itinerary getActiveItineraryForTourist(User tourist) {
        LocalDate today = LocalDate.now();

        Optional<ItineraryParticipant> activeParticipant =
                itineraryParticipantRepository.findActiveItineraryForTourist(
                        tourist.getId(),
                        ItineraryStatus.APPROVED,
                        today
                );


        return activeParticipant.map(ItineraryParticipant::getItinerary).orElse(null);
    }

    // =====================================================
    // GET PUBLIC/PENDING/ALL ITINERARIES
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

    public List<Itinerary> getAll() {
        return itineraryRepository.findAll();
    }

    // =====================================================
    // APPROVE / REJECT ITINERARY (ADMIN)
    // =====================================================
    public Itinerary approve(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        itinerary.setStatus(ItineraryStatus.APPROVED);
        return itineraryRepository.save(itinerary);
    }

    public Itinerary reject(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
        itinerary.setStatus(ItineraryStatus.REJECTED);
        return itineraryRepository.save(itinerary);
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
