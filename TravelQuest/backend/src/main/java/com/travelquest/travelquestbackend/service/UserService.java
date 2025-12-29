package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    // =====================================================
    // GET USER BY EMAIL
    // =====================================================
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    // =====================================================
    // GET USER BY NAME
    // =====================================================
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
    }
    // =====================================================
    // OPTIONAL: GET LOGGED USER FROM SESSION / JWT
    // =====================================================
    // Poți adăuga o metodă care să returneze userul curent pe baza contextului de securitate
}
