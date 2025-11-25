package com.travelquest.travelquestbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Bean pentru criptarea parolelor cu BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configurarea filtrelor de securitate
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // dezactivare CSRF
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // permitere register/login
                        .anyRequest().authenticated()               // restul necesită autentificare
                )
                .formLogin(form -> form.disable())   // dezactivare form login
                .httpBasic(httpBasic -> httpBasic.disable()); // dezactivare Basic Auth

        return http.build();
    }

}
