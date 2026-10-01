package com.example.buildpro.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class IndianLocationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mapbox.access.token:}")
    private String mapboxAccessToken;

    /**
     * Get accurate address details for Indian locations using free APIs
     */
    public Map<String, String> getAddressFromCoordinates(double latitude, double longitude) {
        try {
            // Try multiple free APIs in order of accuracy for Indian addresses
            Map<String, String> result = null;

            // 1. Try OpenStreetMap Nominatim with Indian focus (most reliable free API)
            result = getAddressFromNominatimIndia(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Nominatim India result");
                return result;
            }

            // 2. Try Here Maps API (free tier, good for India)
            result = getAddressFromHereMapsIndia(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Here Maps India result");
                return result;
            }

            // 3. Try Mapbox API (free tier, good accuracy)
            result = getAddressFromMapboxIndia(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Mapbox India result");
                return result;
            }

            // 4. Try Google Maps API (if key is available)
            result = getAddressFromGoogleMapsIndia(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Google Maps India result");
                return result;
            }

            // If all fail, return fallback
            System.out.println("All APIs failed, using fallback address");
            return getFallbackAddress();

        } catch (Exception e) {
            System.err.println("Error getting address from coordinates: " + e.getMessage());
            return getFallbackAddress();
        }
    }

    /**
     * Get address from OpenStreetMap Nominatim with Indian focus
     */
    private Map<String, String> getAddressFromNominatimIndia(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%.6f&lon=%.6f&addressdetails=1&accept-language=en&countrycodes=in&zoom=18",
                    latitude, longitude);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("address")) {
                JsonNode address = jsonNode.get("address");

                Map<String, String> result = new HashMap<>();

                // Get address line 1 with better logic for Indian addresses
                String houseNumber = getAddressComponent(address, "house_number");
                String road = getAddressComponent(address, "road");
                String building = getAddressComponent(address, "building");
                String village = getAddressComponent(address, "village");
                String hamlet = getAddressComponent(address, "hamlet");

                String addressLine1 = "";
                if (houseNumber != null && road != null) {
                    addressLine1 = houseNumber + " " + road;
                } else if (road != null) {
                    addressLine1 = road;
                } else if (building != null) {
                    addressLine1 = building;
                } else if (village != null) {
                    addressLine1 = village;
                } else if (hamlet != null) {
                    addressLine1 = hamlet;
                } else {
                    // Try other options
                    String suburb = getAddressComponent(address, "suburb");
                    String neighbourhood = getAddressComponent(address, "neighbourhood");
                    if (suburb != null) {
                        addressLine1 = suburb;
                    } else if (neighbourhood != null) {
                        addressLine1 = neighbourhood;
                    } else {
                        addressLine1 = "Current Location";
                    }
                }

                result.put("addressLine1", addressLine1);
                result.put("addressLine2", "");

                // Get city with better fallback for Indian addresses
                String city = getAddressComponent(address, "city", "town", "village", "hamlet", "suburb");
                if (city == null || city.trim().isEmpty()) {
                    city = getAddressComponent(address, "county", "district");
                }
                if (city == null || city.trim().isEmpty()) {
                    city = getAddressComponent(address, "state_district");
                }
                result.put("city", city != null ? city : "Unknown");

                // Get state with better mapping for Indian states
                String state = getAddressComponent(address, "state", "province", "region");
                if (state == null || state.trim().isEmpty()) {
                    state = getAddressComponent(address, "administrative_area_level_1");
                }
                result.put("state", state != null ? state : "Unknown");

                // Get postal code with validation for Indian PIN codes
                String postalCode = getAddressComponent(address, "postcode");
                if (postalCode != null && postalCode.matches("\\d{6}")) {
                    result.put("postalCode", postalCode);
                } else {
                    result.put("postalCode", "");
                }

                // Get country
                String country = getAddressComponent(address, "country");
                result.put("country", country != null ? country : "India");

                return result;
            }
        } catch (Exception e) {
            System.err.println("Nominatim India API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Get address from Here Maps API with Indian focus
     */
    private Map<String, String> getAddressFromHereMapsIndia(double latitude, double longitude) {
        try {
            // Using Here Maps free tier with Indian focus
            String url = String.format(
                    "https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=%.6f,%.6f&mode=retrieveAddresses&maxresults=1&gen=9&country=IND&language=en",
                    latitude, longitude);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("Response") && jsonNode.get("Response").has("View") &&
                    jsonNode.get("Response").get("View").size() > 0) {

                JsonNode view = jsonNode.get("Response").get("View").get(0);
                if (view.has("Result") && view.get("Result").size() > 0) {
                    JsonNode result = view.get("Result").get(0);
                    JsonNode location = result.get("Location");
                    JsonNode address = location.get("Address");

                    Map<String, String> addressMap = new HashMap<>();

                    // Build address line 1

                    addressMap.put("city", address.has("City") ? address.get("City").asText() : "Unknown");
                    addressMap.put("state", address.has("State") ? address.get("State").asText() : "Unknown");
                    addressMap.put("postalCode", address.has("PostalCode") ? address.get("PostalCode").asText() : "");
                    addressMap.put("country", address.has("Country") ? address.get("Country").asText() : "India");

                    return addressMap;
                }
            }
        } catch (Exception e) {
            System.err.println("Here Maps India API error: " + e.getMessage());
        }
        // Fallback to Mapbox if Here Maps fails
        return getAddressFromMapboxIndia(latitude, longitude);
    }

    /**
     * Get address from Mapbox API with Indian focus
     */
    private Map<String, String> getAddressFromMapboxIndia(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://api.mapbox.com/geocoding/v5/mapbox.places/%.6f,%.6f.json?access_token=%s&types=address,poi&country=IN&language=en",
                    longitude, latitude, mapboxAccessToken);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("features") && jsonNode.get("features").size() > 0) {
                JsonNode feature = jsonNode.get("features").get(0);
                JsonNode context = feature.get("context");

                Map<String, String> address = new HashMap<>();
                address.put("addressLine1", feature.get("place_name").asText());
                address.put("addressLine2", "");

                // Parse context for city, state, postal code
                for (JsonNode ctx : context) {
                    JsonNode id = ctx.get("id");
                    if (id != null) {
                        String idStr = id.asText();
                        String text = ctx.get("text").asText();

                        if (idStr.startsWith("place.")) {
                            address.put("city", text);
                        } else if (idStr.startsWith("region.")) {
                            address.put("state", text);
                        } else if (idStr.startsWith("postcode.")) {
                            address.put("postalCode", text);
                        } else if (idStr.startsWith("country.")) {
                            address.put("country", text);
                        }
                    }
                }

                if (!address.containsKey("country") || address.get("country").isEmpty()) {
                    address.put("country", "India");
                }

                return address;
            }
        } catch (Exception e) {
            System.err.println("Mapbox India API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Get address from Google Maps API with Indian focus (if key available)
     */
    private Map<String, String> getAddressFromGoogleMapsIndia(double latitude, double longitude) {
        try {
            // This would require a Google Maps API key
            // For now, return empty to use free APIs only
            return new HashMap<>();
        } catch (Exception e) {
            System.err.println("Google Maps India API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Validate if address data is complete and accurate for Indian addresses
     */
    private boolean isValidIndianAddress(Map<String, String> address) {
        if (address == null || address.isEmpty()) {
            return false;
        }

        String city = address.get("city");
        String state = address.get("state");
        String postalCode = address.get("postalCode");

        // Check if we have at least city and state
        boolean hasLocation = (city != null && !city.trim().isEmpty() &&
                !city.equals("Unknown") && !city.equals("null")) &&
                (state != null && !state.trim().isEmpty() &&
                        !state.equals("Unknown") && !state.equals("null"));

        // Check if postal code looks valid (6 digits for India)
        boolean hasValidPostalCode = postalCode != null && !postalCode.trim().isEmpty() &&
                !postalCode.equals("Unknown") && !postalCode.equals("0") &&
                postalCode.matches("\\d{6}");

        return hasLocation && hasValidPostalCode;
    }

    /**
     * Get fallback address when all APIs fail
     */
    private Map<String, String> getFallbackAddress() {
        Map<String, String> address = new HashMap<>();
        address.put("addressLine1", "Current Location");
        address.put("addressLine2", "");
        address.put("city", "Unknown");
        address.put("state", "Unknown");
        address.put("postalCode", "");
        address.put("country", "India");
        return address;
    }

    /**
     * Get address component from multiple possible keys
     */
    private String getAddressComponent(JsonNode address, String... keys) {
        for (String key : keys) {
            if (address.has(key)) {
                String value = address.get(key).asText();
                if (value != null && !value.trim().isEmpty()) {
                    return value;
                }
            }
        }
        return null;
    }

    /**
     * Validate coordinates
     */
    public boolean isValidCoordinates(double latitude, double longitude) {
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }
}
