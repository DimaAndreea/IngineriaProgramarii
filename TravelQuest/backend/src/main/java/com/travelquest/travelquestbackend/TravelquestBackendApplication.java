package com.travelquest.travelquestbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling

public class TravelquestBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelquestBackendApplication.class, args);
    }
}
