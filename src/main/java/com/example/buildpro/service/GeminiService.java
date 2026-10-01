package com.example.buildpro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestClient restClient;

    public GeminiService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public String getChatResponse(String userMessage) {
        try {
            // Construct the request body adhering to Gemini API API structure
            // Structure: { "contents": [{ "parts": [{ "text": "..." }] }] }
            String systemPrompt = """
                    You are a helpful assistant for a E-commerce Marketplace application.
                    Here is the map of the application:
                    - Home: /
                    - Login: /login
                    - Cart: /cart
                    - Categories: /categories
                    - Checkout: /checkout
                    - Products: /products
                    - Profile: /profile
                    - Orders: /orders
                    - Edit Profile: /profile/edit

                    Rules:
                    1. If the user asks to navigate to any page (orders, cart, login, home, products, etc.), you MUST strictly include the tag [[NAVIGATE: <url>]] in your response. Example: [[NAVIGATE: /cart/view]] or [[NAVIGATE: /profile]]
                    2. Answer questions about what the application can do based on the map above.
                    3. Be concise and friendly.
                    4. Don't expose any confidential data
                    5. Don't expose any API keys
                    6. Don't expose any database credentials
                    7. DETECT the language and script of the user's input (including transliterated text, e.g., Telugu written in English characters like 'Nenu orders chudali').
                    8. TRANSLATE the intent to English internally to match against the application map.
                    9. GENERATE the response in the SAME language and SAME script/style as the user's input. (e.g., If user types transliterated Telugu, reply in transliterated Telugu).

                    User Message:
                    """
                    + userMessage;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", systemPrompt)))));

            // Use header for API key
            Map<String, Object> response = restClient.post()
                    .uri(apiUrl)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return extractTextFromResponse(response);

        } catch (Exception e) {
            e.printStackTrace();
            return "I'm having trouble connecting to my brain right now. Please try again later. (" + e.getMessage()
                    + ")";
        }
    }

    /**
     * Async wrapper — runs getChatResponse() on the dedicated aiTaskExecutor pool.
     * The ChatController should call this instead of getChatResponse() directly,
     * so the Gemini HTTP call never blocks a Tomcat thread.
     */
    @Async("aiTaskExecutor")
    public CompletableFuture<String> getChatResponseAsync(String userMessage) {
        return CompletableFuture.completedFuture(getChatResponse(userMessage));
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            if (response == null || !response.containsKey("candidates")) {
                return "No response generated.";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates.isEmpty())
                return "No candidates returned.";

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            if (parts.isEmpty())
                return "";

            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage();
        }
    }
}
