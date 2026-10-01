package com.example.buildpro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MegaMartApplication {

	public static void main(String[] args) {
		SpringApplication.run(MegaMartApplication.class, args);
	}
}