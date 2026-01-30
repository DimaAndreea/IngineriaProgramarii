package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.ActiveItineraryTouristDto;
import com.travelquest.travelquestbackend.dto.ItineraryRequest;
import com.travelquest.travelquestbackend.model.*;
import com.travelquest.travelquestbackend.repository.ItineraryParticipantRepository;
import com.travelquest.travelquestbackend.repository.ItineraryRepository;
import com.travelquest.travelquestbackend.repository.ItinerarySubmissionRepository;
import com.travelquest.travelquestbackend.repository.UserRepository;
import com.travelquest.travelquestbackend.service.PointsService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class ItineraryService {

    private static final int GUIDE_XP_PER_JOIN = 25;

    private final PointsService pointsService;


    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final ItineraryParticipantRepository itineraryParticipantRepository;
    private final ItinerarySubmissionRepository itinerarySubmissionRepository;

    public ItineraryService(ItineraryRepository itineraryRepository,
                            UserRepository userRepository,
                            ItineraryParticipantRepository itineraryParticipantRepository,
                            ItinerarySubmissionRepository itinerarySubmissionRepository,
                            PointsService pointsService) {
        this.itineraryRepository = itineraryRepository;
        this.userRepository = userRepository;
        this.itineraryParticipantRepository = itineraryParticipantRepository;
        this.itinerarySubmissionRepository = itinerarySubmissionRepository;
        this.pointsService = pointsService;
    }

    // =====================================================
    // CREATE ITINERARY
    // =====================================================
    public Itinerary create(ItineraryRequest req, User creator) {
        if (creator == null) {
            throw new EntityNotFoundException("Creator not found in session");
        }

        LocalDate startDate = LocalDate.parse(req.getStartDate());
        LocalDate endDate = LocalDate.parse(req.getEndDate());

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

        boolean overlaps = itineraryRepository.existsOverlappingItineraryForGuide(
                creator.getId(),
                startDate,
                endDate
        );

        if (overlaps) {
            throw new RuntimeException("You already have another itinerary in this time interval.");
        }

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
    // UPDATE ITINERARY
    // =====================================================
    public Itinerary update(Long id, ItineraryRequest req, User loggedUser) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("You cannot edit someone else's itinerary");
        }

        if (itinerary.getStatus() != ItineraryStatus.PENDING) {
            throw new RuntimeException("Cannot edit an approved/rejected itinerary");
        }

        LocalDate startDate = LocalDate.parse(req.getStartDate());
        LocalDate endDate = LocalDate.parse(req.getEndDate());

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

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
    // DELETE ITINERARY
    // =====================================================
    public void delete(Long id, User loggedUser) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (!itinerary.getCreator().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("Cannot delete someone else's itinerary");
        }

        itineraryRepository.delete(itinerary);
    }

    // =====================================================
    // TOURIST — JOIN ITINERARY
    // =====================================================
    @Transactional
    public String joinItinerary(Long itineraryId, User user) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));

        if (itinerary.getStatus() != ItineraryStatus.APPROVED) {
            throw new RuntimeException("Cannot join a non-approved itinerary");
        }

        if (user.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("Only tourist users can join an itinerary");
        }

        // =========================
        // PAID ITINERARY CHECK (VARIANTA A)
        // Join NU este permis fără cumpărare.
        // Frontend trebuie să folosească: POST /api/itineraries/{id}/buy
        // =========================
        if (itinerary.getPrice() > 0) {
            throw new RuntimeException("This itinerary requires purchase. Please buy first.");
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

        // =========================
        // GUIDE XP (+25) LA INSCRIERE NOUA
        // =========================
        User guide = itinerary.getCreator();
        if (guide != null && guide.getRole() == UserRole.GUIDE) {
            pointsService.addPointsForItineraryJoinedGuide(guide.getId(), itinerary.getId());
        }

        return "TOUR JOINED! Welcome to the adventure, " + user.getUsername();
    }

    // =====================================================
    // GET ACTIVE ITINERARY FOR TOURIST — DTO
    // =====================================================
    public ActiveItineraryTouristDto getActiveItineraryForTouristDto(User tourist) {
        LocalDate today = LocalDate.now();

        List<Itinerary> activeItineraries =
                itineraryRepository.findActiveItinerariesForTourist(tourist.getId(), today);

        if (activeItineraries.isEmpty()) return null;

        Itinerary itinerary = activeItineraries.get(0);

        // Force LAZY loading for locations & objectives
        itinerary.getLocations().forEach(loc -> loc.getObjectives().size());

        // Fetch submissions using repository instance
        List<ObjectiveSubmission> submissions =
                itinerarySubmissionRepository.findByItineraryAndTourist(itinerary, tourist);

        ActiveItineraryTouristDto dto = ActiveItineraryTouristDto.fromItinerary(itinerary, submissions);

        System.out.println("=== Active Itinerary DTO for tourist ===");
        System.out.println(dto);

        return dto;
    }

    // =====================================================
    // GET ACTIVE ITINERARIES FOR GUIDE
    // =====================================================
    public List<Itinerary> getActiveItinerariesForGuide(User guide) {
        if (guide == null) return List.of();

        LocalDate today = LocalDate.now();
        List<Itinerary> result = itineraryRepository.findActiveItinerariesForGuide(guide.getId(), today);
        return result != null ? result : List.of();
    }

    // =====================================================
    // GET ITINERARY BY ID
    // =====================================================
    public Itinerary getById(Long id) {
        return itineraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Itinerary not found"));
    }

    // =====================================================
    // GET PUBLIC/PENDING/ALL ITINERARIES
    // =====================================================
    public List<Itinerary> getPublic() {
        return itineraryRepository.findByStatus(ItineraryStatus.APPROVED);
    }

    public List<Itinerary> getPending() {
        return itineraryRepository.findByStatus(ItineraryStatus.PENDING);
    }

    public List<Itinerary> getAll() {
        return itineraryRepository.findAll();
    }

    public List<Itinerary> getGuideItineraries(Long guideId) {
        return itineraryRepository.findByCreatorId(guideId);
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
}
