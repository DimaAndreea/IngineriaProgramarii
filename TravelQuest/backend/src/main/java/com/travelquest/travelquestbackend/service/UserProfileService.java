package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.UserProfileDto;
import com.travelquest.travelquestbackend.model.User;

import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.UserRepository;
import com.travelquest.travelquestbackend.service.BadgeProfileService;
import com.travelquest.travelquestbackend.dto.MyBadgeDto;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final BadgeProfileService badgeProfileService;

    public UserProfileService(UserRepository userRepository, BadgeProfileService badgeProfileService) {
        this.userRepository = userRepository;
        this.badgeProfileService = badgeProfileService;
    }

    public UserProfileDto getMyProfile(User loggedUser) {
        if (loggedUser == null) {
            throw new RuntimeException("Not authenticated");
        }

        System.out.println("getMyProfile called for user: " + loggedUser.getUsername());
        System.out.println("Email: " + loggedUser.getEmail());
        System.out.println("Phone: " + loggedUser.getPhoneNumber());

        return mapToDto(loggedUser);
    }

    public UserProfileDto getGuideProfile(Long guideId) {
        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        System.out.println("getGuideProfile called for guideId: " + guideId);
        System.out.println("Username: " + guide.getUsername());
        System.out.println("Email: " + guide.getEmail());
        System.out.println("Phone: " + guide.getPhoneNumber());

        if (guide.getRole() != UserRole.GUIDE) {
            throw new RuntimeException("User is not a guide");
        }

        // Return full profile (debug first)
        return mapToDto(guide);
    }

    public UserProfileDto getTouristProfile(Long touristId) {
        User tourist = userRepository.findById(touristId)
                .orElseThrow(() -> new RuntimeException("Tourist not found"));

        System.out.println("getTouristProfile called for touristId: " + touristId);
        System.out.println("Username: " + tourist.getUsername());
        System.out.println("Email: " + tourist.getEmail());
        System.out.println("Phone: " + tourist.getPhoneNumber());

        if (tourist.getRole() != UserRole.TOURIST) {
            throw new RuntimeException("User is not a tourist");
        }

        return mapToDto(tourist);
    }

    private UserProfileDto mapToDto(User user) {
        List<MyBadgeDto> badges = badgeProfileService.getMyBadges(user.getId());
        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                badges
        );
    }
}
