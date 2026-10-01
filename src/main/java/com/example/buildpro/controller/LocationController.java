package com.example.buildpro.controller;

import com.example.buildpro.service.IndianLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private IndianLocationService locationService;

    @GetMapping("/address")
    public ResponseEntity<Map<String, String>> getAddressFromCoordinates(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        // Validate coordinates
        if (!locationService.isValidCoordinates(latitude, longitude)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Map<String, String> addressDetails = locationService.getAddressFromCoordinates(latitude, longitude);
            return ResponseEntity.ok(addressDetails);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
