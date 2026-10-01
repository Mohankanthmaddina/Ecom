package com.example.buildpro.controller;

import com.example.buildpro.model.Category;
import com.example.buildpro.model.Product;
import com.example.buildpro.model.User;
import com.example.buildpro.model.analytics.ProductTrendingAnalytics;
import com.example.buildpro.model.analytics.UserCategoryPreference;
import com.example.buildpro.service.AnalyticsService;
import com.example.buildpro.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsRestController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserService userService;

    /**
     * REST endpoint providing personalized product feed for logged-in user or guest.
     * New Users -> Trending Products Feed
     * Active Users -> Preference-based Feed
     */
    @GetMapping("/feed")
    public ResponseEntity<Map<String, Object>> getPersonalizedProductFeed(
            Principal principal,
            @RequestParam(required = false) Long userId) {
        User user = resolveUser(principal, userId);

        boolean isNewUser = analyticsService.isNewOrInactiveUser(user);
        Optional<UserCategoryPreference> prefOpt = analyticsService.getUserCategoryPreference(user);
        List<Product> products = analyticsService.getUserProductFeed(user);
        List<ProductTrendingAnalytics> trending = analyticsService.getTopTrendingAnalytics();

        List<com.example.buildpro.dto.ProductDTO> productDTOs = products.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("isNewUser", isNewUser);
        response.put("feedType", isNewUser ? "TRENDING_PRODUCTS" : "PERSONALIZED_PREFERENCE");
        response.put("preferredCategory", prefOpt.map(UserCategoryPreference::getCategoryName).orElse(null));
        response.put("products", productDTOs);
        response.put("trendingProducts", trending);

        return ResponseEntity.ok(response);
    }

    private com.example.buildpro.dto.ProductDTO convertToDTO(Product product) {
        com.example.buildpro.dto.ProductDTO dto = new com.example.buildpro.dto.ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setPrice(product.getPrice());
        dto.setDescription(product.getDescription());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setSpecifications(product.getSpecifications());
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : "No Category");
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        return dto;
    }

    /**
     * REST endpoint providing category list reordered for current user preference.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getPersonalizedCategories(
            Principal principal,
            @RequestParam(required = false) Long userId) {
        User user = resolveUser(principal, userId);
        List<Category> categories = analyticsService.getCategoryFeed(user);
        return ResponseEntity.ok(categories);
    }

    /**
     * REST endpoint returning category preference details for the current user.
     */
    @GetMapping("/user-preference")
    public ResponseEntity<?> getUserPreference(
            Principal principal,
            @RequestParam(required = false) Long userId) {
        User user = resolveUser(principal, userId);
        if (user == null) {
            return ResponseEntity.ok(Map.of("isLoggedIn", false, "message", "Guest user - no preferences recorded."));
        }

        Optional<UserCategoryPreference> pref = analyticsService.getUserCategoryPreference(user);
        if (pref.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "isLoggedIn", true,
                "isNewUser", true,
                "message", "New user with no category activity yet. Showing trending items."
            ));
        }

        return ResponseEntity.ok(pref.get());
    }

    private User resolveUser(Principal principal, Long userId) {
        if (principal != null) {
            Optional<User> userOpt = userService.findByEmail(principal.getName());
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
        }
        if (userId != null) {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
        }
        return null;
    }
}
