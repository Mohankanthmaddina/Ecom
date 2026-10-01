package com.example.buildpro.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class IndianLocationServiceTest {

    @Test
    void testValidCoordinates() {
        IndianLocationService locationService = new IndianLocationService();

        // Valid coordinates
        assertTrue(locationService.isValidCoordinates(28.6139, 77.2090)); // New Delhi
        assertTrue(locationService.isValidCoordinates(19.0760, 72.8777)); // Mumbai
        assertTrue(locationService.isValidCoordinates(12.9716, 77.5946)); // Bangalore
        assertTrue(locationService.isValidCoordinates(0.0, 0.0)); // Equator/Prime Meridian

        // Invalid coordinates
        assertFalse(locationService.isValidCoordinates(91.0, 0.0)); // Invalid latitude
        assertFalse(locationService.isValidCoordinates(-91.0, 0.0)); // Invalid latitude
        assertFalse(locationService.isValidCoordinates(0.0, 181.0)); // Invalid longitude
        assertFalse(locationService.isValidCoordinates(0.0, -181.0)); // Invalid longitude
    }

    @Test
    @org.junit.jupiter.api.Disabled("Fails when Here Maps API is unreachable or rate-limited")
    void testGetAddressFromCoordinatesDelhi() {
        IndianLocationService locationService = new IndianLocationService();

        // Test with New Delhi coordinates
        Map<String, String> address = locationService.getAddressFromCoordinates(28.6139, 77.2090);

        assertNotNull(address);
        assertTrue(address.containsKey("addressLine1"));
        assertTrue(address.containsKey("city"));
        assertTrue(address.containsKey("state"));
        assertTrue(address.containsKey("postalCode"));
        assertTrue(address.containsKey("country"));

        // Verify that we get some address information
        assertFalse(address.get("addressLine1").isEmpty());
        assertFalse(address.get("city").isEmpty());

        // Check if it's likely to be Delhi
        String city = address.get("city").toLowerCase();
        String state = address.get("state").toLowerCase();
        assertTrue(city.contains("delhi") || state.contains("delhi") ||
                city.contains("new delhi") || state.contains("new delhi"));
    }

    @Test
    @org.junit.jupiter.api.Disabled("Fails when Here Maps API is unreachable or rate-limited")
    void testGetAddressFromCoordinatesMumbai() {
        IndianLocationService locationService = new IndianLocationService();

        // Test with Mumbai coordinates
        Map<String, String> address = locationService.getAddressFromCoordinates(19.0760, 72.8777);

        assertNotNull(address);
        assertTrue(address.containsKey("addressLine1"));
        assertTrue(address.containsKey("city"));
        assertTrue(address.containsKey("state"));
        assertTrue(address.containsKey("postalCode"));
        assertTrue(address.containsKey("country"));

        // Verify that we get some address information
        assertFalse(address.get("addressLine1").isEmpty());
        assertFalse(address.get("city").isEmpty());

        // Check if it's likely to be Mumbai
        String city = address.get("city").toLowerCase();
        String state = address.get("state").toLowerCase();
        assertTrue(city.contains("mumbai") || state.contains("mumbai") ||
                city.contains("maharashtra") || state.contains("maharashtra"));
    }

    @Test
    void testGetAddressFromCoordinatesWithInvalidCoordinates() {
        IndianLocationService locationService = new IndianLocationService();

        // Test with invalid coordinates - should return fallback address
        Map<String, String> address = locationService.getAddressFromCoordinates(999.0, 999.0);

        assertNotNull(address);
        assertEquals("Current Location", address.get("addressLine1"));
        assertEquals("Unknown", address.get("city"));
        assertEquals("Unknown", address.get("state"));
        assertEquals("India", address.get("country"));
    }
}
