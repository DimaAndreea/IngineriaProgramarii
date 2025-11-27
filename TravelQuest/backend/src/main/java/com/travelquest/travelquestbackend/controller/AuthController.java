package com.travelquest.travelquestbackend.controller;

import com.travelquest.travelquestbackend.dto.LoginRequest;
import com.travelquest.travelquestbackend.dto.LoginResponse;
import com.travelquest.travelquestbackend.dto.RegisterRequest;
import com.travelquest.travelquestbackend.service.AuthService;
import com.travelquest.travelquestbackend.service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RegisterService registerService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        /// afișează datele primite în consola backend-ului
        System.out.println("Login attempt:");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());
        System.out.println("Role: " + request.getRole());

        LoginResponse response = authService.authenticate(request);
        System.out.println("Login success: " + response.isSuccess());
        return ResponseEntity.status(response.isSuccess() ? 200 : 401).body(response);
    }


    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        System.out.println("Received register request for: " + request.getUsername());
        LoginResponse response = registerService.register(request);
        return ResponseEntity.status(response.isSuccess() ? 200 : 400).body(response);
    }
}

