package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.LoginRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.dto.RegisterRequest;
import com.travelquest.travelquestbackend.service.AuthService;
import com.travelquest.travelquestbackend.service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/***********************************************
 * Controller pentru autentificare si inregistrare

 * - Ofera endpoint-uri REST pentru login si register.
 * - Afiseaza datele primite in consola pentru debug.
 * - Returneaza raspunsuri standard (LoginResponse) cu status HTTP.
 *
 * Endpoint-uri:
 * 1. POST /api/auth/login   -> autentificare utilizator
 * 2. POST /api/auth/register -> inregistrare utilizator

 ***********************************************/

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RegisterService registerService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        System.out.println("Login attempt:");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());
        System.out.println("Role: " + request.getRole());

        LoginResponse response = authService.authenticate(request);

        System.out.println("Login success: " + response.isSuccess());
        System.out.println("User ID: " + response.getUserId());
        System.out.println("Username: " + response.getUsername());
        System.out.println("Role returned: " + response.getRole());

        return ResponseEntity
                .status(response.isSuccess() ? 200 : 401)
                .body(response);
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
        System.out.println("Register response: " + response.getMessage());
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }

}

