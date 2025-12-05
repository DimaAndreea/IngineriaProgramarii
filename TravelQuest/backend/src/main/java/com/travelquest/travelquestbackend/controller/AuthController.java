package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.LoginRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.dto.RegisterRequest;
import com.travelquest.travelquestbackend.model.User;
import com.travelquest.travelquestbackend.repository.UserRepository;
import com.travelquest.travelquestbackend.service.AuthService;
import com.travelquest.travelquestbackend.service.RegisterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RegisterService registerService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {

        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());
        System.out.println("Role: " + request.getRole());

        LoginResponse response = authService.authenticate(request);

        if (!response.isSuccess()) {
            System.out.println("❌ Login failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        System.out.println("✅ Login successful. Creating session...");

        // 1️⃣ Load user entity
        User user = userRepository.findById(response.getUserId()).orElse(null);
        if (user == null) {
            System.out.println("❌ User not found after login!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // 2️⃣ Create authentication token
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    List.of(() -> "ROLE_" + user.getRole().name())
            );


        // 3️⃣ Register authentication into Spring Security
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // 4️⃣ Create HTTP session → THIS GENERATES JSESSIONID COOKIE
        httpRequest.getSession(true);

        System.out.println("✅ Session created. JSESSIONID should be sent now.");

        return ResponseEntity.ok(response);
    }


    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        System.out.println("=== REGISTER REQUEST RECEIVED ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Phone: " + request.getPhoneNumber());
        System.out.println("Password: " + request.getPassword());
        System.out.println("Role: " + request.getRole());
        System.out.println("AdminCode: " + request.getAdminCode());
        System.out.println("================================");

        LoginResponse response = registerService.register(request);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
}
