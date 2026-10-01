package com.example.buildpro.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "app.location.api.key="
})
class LocationServiceTest {

    @Test
    void testValidCoordinates() {
        LocationService locationService = new LocationService();

        // Valid coordinates
        assertTrue(locationService.isValidCoordinates(40.7128, -74.0060)); // New York
        assertTrue(locationService.isValidCoordinates(0.0, 0.0)); // Equator/Prime Meridian
        assertTrue(locationService.isValidCoordinates(90.0, 180.0)); // North Pole
        assertTrue(locationService.isValidCoordinates(-90.0, -180.0)); // South Pole

        // Invalid coordinates
        assertFalse(locationService.isValidCoordinates(91.0, 0.0)); // Invalid latitude
        assertFalse(locationService.isValidCoordinates(-91.0, 0.0)); // Invalid latitude
        assertFalse(locationService.isValidCoordinates(0.0, 181.0)); // Invalid longitude
        assertFalse(locationService.isValidCoordinates(0.0, -181.0)); // Invalid longitude
    }

    @Test
    void testGetAddressFromCoordinates() {
        LocationService locationService = new LocationService();

        // Test with a known location (New York City)
        Map<String, String> address = locationService.getAddressFromCoordinates(40.7128, -74.0060);

        assertNotNull(address);
        assertTrue(address.containsKey("addressLine1"));
        assertTrue(address.containsKey("city"));
        assertTrue(address.containsKey("state"));
        assertTrue(address.containsKey("postalCode"));
        assertTrue(address.containsKey("country"));

        // Verify that we get some address information
        assertFalse(address.get("addressLine1").isEmpty());
        assertFalse(address.get("city").isEmpty());
    }

    @Test
    void testGetAddressFromCoordinatesWithInvalidCoordinates() {
        LocationService locationService = new LocationService();

        // Test with invalid coordinates - should return fallback address
        Map<String, String> address = locationService.getAddressFromCoordinates(999.0, 999.0);

        assertNotNull(address);
        assertEquals("Current Location", address.get("addressLine1"));
        assertEquals("Unknown", address.get("city"));
        assertEquals("Unknown", address.get("state"));
        assertEquals("India", address.get("country"));
    }
}
