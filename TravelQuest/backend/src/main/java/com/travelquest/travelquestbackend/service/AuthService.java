package com.travelquest.travelquestbackend.service;

import com.travelquest.travelquestbackend.dto.LoginRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

/************************************************************
 * AuthService
 *
 * - Autentifica un user la login.
 * - Verifica daca email-ul exista in baza de date.
 * - Verifica parola folosind PasswordEncoder.
 * - Verifica daca rolul trimis de frontend corespunde rolului userului.
 * - Returneaza LoginResponse cu succes sau mesaj de eroare.
 ************************************************************/

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
        System.out.println("Role from frontend: " + request.getRole());
        System.out.println("========================");

        if (request.getEmail() == null || request.getPassword() == null || request.getRole() == null) {
            return new LoginResponse(false, "Missing credentials");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "Invalid credentials");
        }

        User user = userOpt.get();

        // check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new LoginResponse(false, "Invalid credentials");
        }

        // check role
        if (!user.getRole().name().equalsIgnoreCase(request.getRole())) {
            System.out.println("Role mismatch! User has: " + user.getRole() +
                    ", frontend sent: " + request.getRole());

            return new LoginResponse(false, "Incorrect role selected");
        }

        System.out.println("Login SUCCESS for user: " + user.getUsername() +
                " with role " + user.getRole());

        // ⬇️ AICI TRIMITEM toate datele necesare frontend-ului
        return new LoginResponse(
                true,
                "Login successful",
                user.getId(),        // IMPORTANT
                user.getUsername(),
                user.getRole().name()
        );
    }

}
