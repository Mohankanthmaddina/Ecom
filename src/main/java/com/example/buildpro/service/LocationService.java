package com.example.buildpro.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LocationService {

    @Value("${app.location.google.api.key:}")
    private String googleApiKey;

    @Value("${app.location.mapbox.api.key:}")
    private String mapboxApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get address details from coordinates using improved reverse geocoding
     * Prioritizes accuracy for Indian addresses
     */
    public Map<String, String> getAddressFromCoordinates(double latitude, double longitude) {
        try {
            // Try multiple providers in order of accuracy for Indian addresses
            Map<String, String> result = null;

            // 1. Try Google Maps API first (most accurate for India)
            if (googleApiKey != null && !googleApiKey.trim().isEmpty()) {
                result = getAddressFromGoogleMaps(latitude, longitude);
                if (isValidIndianAddress(result)) {
                    System.out.println("Using Google Maps API result");
                    return result;
                }
            }

            // 2. Try Mapbox API (good accuracy for India)
            if (mapboxApiKey != null && !mapboxApiKey.trim().isEmpty()) {
                result = getAddressFromMapbox(latitude, longitude);
                if (isValidIndianAddress(result)) {
                    System.out.println("Using Mapbox API result");
                    return result;
                }
            }

            // 3. Try OpenStreetMap Nominatim with improved parsing for India
            result = getAddressFromNominatimImproved(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Nominatim API result");
                return result;
            }

            // 4. Try Here Maps API (free tier available)
            result = getAddressFromHereMaps(latitude, longitude);
            if (isValidIndianAddress(result)) {
                System.out.println("Using Here Maps API result");
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
     * Get address from Google Maps API (most accurate for India)
     */
    private Map<String, String> getAddressFromGoogleMaps(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/geocode/json?latlng=%.6f,%.6f&key=%s&language=en&region=in",
                    latitude, longitude, googleApiKey);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("results") && jsonNode.get("results").size() > 0) {
                JsonNode result = jsonNode.get("results").get(0);
                JsonNode addressComponents = result.get("address_components");

                Map<String, String> address = new HashMap<>();
                String streetNumber = "";
                String route = "";

                // Parse address components
                for (JsonNode component : addressComponents) {
                    String longName = component.get("long_name").asText();
                    JsonNode types = component.get("types");

                    for (JsonNode type : types) {
                        String typeStr = type.asText();
                        switch (typeStr) {
                            case "street_number":
                                streetNumber = longName;
                                break;
                            case "route":
                                route = longName;
                                break;
                            case "locality":
                            case "administrative_area_level_2":
                                if (!address.containsKey("city") || address.get("city").isEmpty()) {
                                    address.put("city", longName);
                                }
                                break;
                            case "administrative_area_level_1":
                                address.put("state", longName);
                                break;
                            case "postal_code":
                                address.put("postalCode", longName);
                                break;
                            case "country":
                                address.put("country", longName);
                                break;
                        }
                    }
                }

                // Build address line 1
                String addressLine1 = "";
                if (!streetNumber.isEmpty() && !route.isEmpty()) {
                    addressLine1 = streetNumber + " " + route;
                } else if (!route.isEmpty()) {
                    addressLine1 = route;
                } else if (!streetNumber.isEmpty()) {
                    addressLine1 = streetNumber;
                } else {
                    addressLine1 = "Current Location";
                }

                address.put("addressLine1", addressLine1);
                address.put("addressLine2", "");

                // Set defaults
                if (!address.containsKey("country") || address.get("country").isEmpty()) {
                    address.put("country", "India");
                }

                return address;
            }
        } catch (Exception e) {
            System.err.println("Google Maps API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Get address from Mapbox API
     */
    private Map<String, String> getAddressFromMapbox(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://api.mapbox.com/geocoding/v5/mapbox.places/%.6f,%.6f.json?access_token=%s&types=address,poi&country=IN",
                    longitude, latitude, mapboxApiKey);

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
            System.err.println("Mapbox API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Get address from OpenStreetMap Nominatim API with improved parsing for India
     */
    private Map<String, String> getAddressFromNominatimImproved(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%.6f&lon=%.6f&addressdetails=1&accept-language=en&countrycodes=in",
                    latitude, longitude);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);

            if (jsonNode.has("address")) {
                JsonNode address = jsonNode.get("address");

                Map<String, String> result = new HashMap<>();

                // Get address line 1 with better logic
                String houseNumber = getAddressComponent(address, "house_number");
                String road = getAddressComponent(address, "road");
                String building = getAddressComponent(address, "building");

                String addressLine1 = "";
                if (houseNumber != null && road != null) {
                    addressLine1 = houseNumber + " " + road;
                } else if (road != null) {
                    addressLine1 = road;
                } else if (building != null) {
                    addressLine1 = building;
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

                // Get city with better fallback
                String city = getAddressComponent(address, "city", "town", "village", "hamlet", "suburb");
                if (city == null || city.trim().isEmpty()) {
                    city = getAddressComponent(address, "county", "district");
                }
                result.put("city", city != null ? city : "Unknown");

                // Get state
                String state = getAddressComponent(address, "state", "province", "region");
                result.put("state", state != null ? state : "Unknown");

                // Get postal code with validation
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
            System.err.println("Nominatim API error: " + e.getMessage());
        }
        return new HashMap<>();
    }

    /**
     * Get address from Here Maps API (free tier available)
     */
    private Map<String, String> getAddressFromHereMaps(double latitude, double longitude) {
        try {
            // Using Here Maps free tier
            String url = String.format(
                    "https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json?prox=%.6f,%.6f&mode=retrieveAddresses&maxresults=1&gen=9&country=IND",
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
                    String street = address.has("Street") ? address.get("Street").asText() : "";
                    String houseNumber = address.has("HouseNumber") ? address.get("HouseNumber").asText() : "";
                    String addressLine1 = "";
                    if (!houseNumber.isEmpty() && !street.isEmpty()) {
                        addressLine1 = houseNumber + " " + street;
                    } else if (!street.isEmpty()) {
                        addressLine1 = street;
                    } else if (!houseNumber.isEmpty()) {
                        addressLine1 = houseNumber;
                    } else {
                        addressLine1 = "Current Location";
                    }

                    addressMap.put("addressLine1", addressLine1);
                    addressMap.put("addressLine2", "");
                    addressMap.put("city", address.has("City") ? address.get("City").asText() : "Unknown");
                    addressMap.put("state", address.has("State") ? address.get("State").asText() : "Unknown");
                    addressMap.put("postalCode", address.has("PostalCode") ? address.get("PostalCode").asText() : "");
                    addressMap.put("country", address.has("Country") ? address.get("Country").asText() : "India");

                    return addressMap;
                }
            }
        } catch (Exception e) {
            System.err.println("Here Maps API error: " + e.getMessage());
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
