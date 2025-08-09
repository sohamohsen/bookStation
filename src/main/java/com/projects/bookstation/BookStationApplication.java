package com.projects.bookstation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
 @EnableJpaAuditing
public class BookStationApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookStationApplication.class, args);
    }

}
