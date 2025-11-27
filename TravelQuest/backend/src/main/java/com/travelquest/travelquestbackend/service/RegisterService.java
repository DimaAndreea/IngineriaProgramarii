package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.RegisterRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.model.UserRole;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

/************************************************************
 * RegisterService
 *
 * - Inregistreaza un user nou in aplicatie.
 * - Verifica unicitatea email-ului si username-ului.
 * - Verifica ca rolul primit este valid (TOURIST, GUIDE, ADMIN).
 * - Pentru ADMIN, verifica codul de verificare.
 * - Cripteaza parola folosind PasswordEncoder.
 * - Salveaza userul in baza de date cu atributele implicite (level, xp, travelCoins).
 * - Returneaza LoginResponse cu succes sau mesaj de eroare.
 ************************************************************/

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

        // --- Validare email unic ---
        Optional<User> existingByEmail = userRepository.findByEmail(request.getEmail());
        if (existingByEmail.isPresent()) {
            return new LoginResponse(false, "Email already exists");
        }

        // --- Validare username unic ---
        Optional<User> existingByUsername = userRepository.findByUsername(request.getUsername());
        if (existingByUsername.isPresent()) {
            return new LoginResponse(false, "Username already exists");
        }

        // --- Validare rol ---
        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return new LoginResponse(false, "Invalid role: " + request.getRole());
        }
        System.out.println("Frontend role: " + request.getRole());

        // --- Validare cod admin ---
        if (role == UserRole.ADMIN) {
            System.out.println("Codadmin: " + request.getAdminCode());
            if (request.getAdminCode() == null || !request.getAdminCode().equals("codAdmin")) {
                return new LoginResponse(false, "Invalid admin verification code");
            }
        }

        // --- Debug info ---
        System.out.println("=== REGISTER DEBUG ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Role: " + request.getRole());
        System.out.println("=======================");

        // --- Hash parola ---
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // --- Creare user ---
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(hashedPassword);
        user.setRole(role);

        // --- Atribute bază ---
        user.setLevel(1);
        user.setXp(0);
        user.setTravelCoins(0);

        // --- Salvare în DB ---
        userRepository.save(user);

        return new LoginResponse(true, "User registered successfully!");
    }
}
