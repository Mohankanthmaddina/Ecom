package com.example.buildpro.service;

import com.example.buildpro.dto.ProductDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiSearchService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Passes the user search query and product catalog to Gemini API and returns an ordered list of matched Product IDs.
     */
    public List<Long> searchProducts(String query, List<ProductDTO> products) throws Exception {
        if (products == null || products.isEmpty()) {
            return new ArrayList<>();
        }

        // 1. Prepare the product data as JSON string (limiting fields to save tokens)
        String productsJson = objectMapper.writeValueAsString(products);

        // 2. Construct the prompt
        String promptText = String.format(
                "You are an intelligent e-commerce search engine component.\n" +
                "Given the following product catalog data in JSON:\n" +
                "%s\n\n" +
                "Task: Analyze and rank the products based on how well they match the following user search query: '%s'.\n" +
                "You must strictly return ONLY a raw JSON array structure containing the IDs of the matched products, sorted from most relevant to least relevant.\n" +
                "Example output: [34, 12, 5, 8]\n" +
                "Do not include any other formatting, markdown codes, explanation, or extra text, just the raw JSON array. If no products match, return [].",
                productsJson, query
        );

        // 3. Prepare the request body according to Gemini API specs
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> partsMap = new HashMap<>();
        partsMap.put("text", promptText);
        
        Map<String, Object> contentsMap = new HashMap<>();
        contentsMap.put("parts", List.of(partsMap));
        
        requestBody.put("contents", List.of(contentsMap));

        // Let's add generation config to ensure JSON output
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("response_mime_type", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Sometimes the key is passed as a query param instead of header
        // The properties said URL is: https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent
        String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // 4. Make the HTTP call
        System.out.println("Calling Gemini API for search query: " + query);
        ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Gemini API request failed with status: " + response.getStatusCode());
        }

        // 5. Parse the Response to extract the IDs list
        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode candidates = rootNode.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                String aiResponseText = parts.get(0).path("text").asText().trim();
                
                // aiResponseText should be a JSON array like "[1, 2, 3]"
                try {
                    List<Long> matchedIds = objectMapper.readValue(aiResponseText, objectMapper.getTypeFactory().constructCollectionType(List.class, Long.class));
                    System.out.println("Gemini returned matched IDs: " + matchedIds);
                    return matchedIds;
                } catch (Exception e) {
                    System.err.println("Failed to parse Gemini response text as a JSON list: " + aiResponseText);
                    throw e; // triggers fallback
                }
            }
        }
        
        return new ArrayList<>();
    }
}
