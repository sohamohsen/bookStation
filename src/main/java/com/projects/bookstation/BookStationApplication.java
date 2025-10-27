package com.projects.bookstation;

import com.projects.bookstation.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableAsync
public class BookStationApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookStationApplication.class, args);
    }

    @Bean
    public CommandLineRunner runner(RoleRepository roleRepository) {
        return args -> {
            if(roleRepository.count() == 0) {
                roleRepository.saveAll(
                        java.util.List.of(
                                com.projects.bookstation.entity.Role.builder().role("USER").build(),
                                com.projects.bookstation.entity.Role.builder().role("ADMIN").build()
                        )
                );
            }
        };
    }
}
