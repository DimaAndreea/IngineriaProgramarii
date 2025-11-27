package com.travelquest.travelquestbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;


/***********************************************
 * Configuratie de securitate Spring Security
 *
 * - Configureaza criptarea parolelor cu BCrypt
 * - Dezactiveaza user-ul default din memoria interna
 * - Permite acces liber la toate endpoint-urile pentru test
 * - Dezactiveaza CSRF, form login si HTTP basic authentication
 ***********************************************/


@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // IMPORTANT: dezactivezi user-ul default
    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager(); // fara user implicit
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/static/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().permitAll()   // TEST – lasă totul liber
                )
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}
