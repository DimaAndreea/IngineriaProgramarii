package com.travelquest.travelquestbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/***********************************************
 * Configuratie CORS pentru backend-ul Spring
 *
 * - Permite frontend-ului React (localhost:5173) sa faca cereri HTTP catre backend
 *   fara a fi blocate de politica CORS a browser-ului
 * - Se aplica pentru toate endpoint-urile (/**)
 * - Permite metodele HTTP: GET, POST, PUT, DELETE, OPTIONS
 * - Permite trimiterea cookie-urilor si autentificarea (allowCredentials)
 * - Metoda addCorsMappings adauga regulile de CORS pentru toate endpoint-urile
 ***********************************************/


@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // toate endpoint-urile
                        .allowedOrigins("http://localhost:5173") // frontend-ul React
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
