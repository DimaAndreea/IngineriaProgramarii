package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.UserProfileDto;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
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


    private UserProfileDto mapToDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole()
        );
    }
}
