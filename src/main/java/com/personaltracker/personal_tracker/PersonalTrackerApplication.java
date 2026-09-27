package com.personaltracker.personal_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class PersonalTrackerApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                PersonalTrackerApplication.class,
                args
        );
    }

    @Bean
    public TrackerTools trackerTools(JdbcTemplate jdbcTemplate) {

        return new TrackerTools(jdbcTemplate);
    }
}