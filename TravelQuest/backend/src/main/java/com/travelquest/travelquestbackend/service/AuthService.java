package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.LoginRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse authenticate(LoginRequest request) {
        System.out.println("=== LOGIN DEBUG INFO ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());
        System.out.println("========================");

        if (request.getEmail() == null || request.getPassword() == null) {
            return new LoginResponse(false, "Missing credentials");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "Credentials invalid");
        }

        User user = userOpt.get();

        // verificăm parola cu bcrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new LoginResponse(false, "Credentials invalid");
        }

        // succes: returnăm rolul și mesajul
        return new LoginResponse(true, "Login successful");
    }
}
