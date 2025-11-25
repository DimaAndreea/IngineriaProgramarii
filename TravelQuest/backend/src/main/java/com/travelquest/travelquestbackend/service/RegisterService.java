package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.RegisterRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse; // folosim același DTO
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse register(RegisterRequest request) {

        // Verificare dacă email-ul există deja
        Optional<User> existingByEmail = userRepository.findByEmail(request.getEmail());
        if (existingByEmail.isPresent()) {
            return new LoginResponse(false, "Email already exists");
        }

        // Verificare dacă username-ul există deja
        Optional<User> existingByUsername = userRepository.findByUsername(request.getUsername());
        if (existingByUsername.isPresent()) {
            return new LoginResponse(false, "Username already exists");
        }

        // Debug info
        System.out.println("=== REGISTER DEBUG INFO ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Password (plaintext): " + request.getPassword());

        // Hash parola
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        System.out.println("Password (hashed): " + hashedPassword);
        System.out.println("============================");

        // Creare obiect User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(hashedPassword);

        // Conversie string → enum
        try {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            return new LoginResponse(false, "Invalid role: " + request.getRole());
        }

        // Setări inițiale
        user.setLevel(1);
        user.setXp(0);
        user.setTravelCoins(0);

        // Salvare în baza de date
        userRepository.save(user);

        return new LoginResponse(true, "User registered successfully!");
    }
}
