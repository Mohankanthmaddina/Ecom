package com.example.buildpro.controller;

import com.example.buildpro.model.User;
import com.example.buildpro.model.Order;
import com.example.buildpro.service.UserService;
import com.example.buildpro.service.OrderService;
import com.example.buildpro.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserProfileRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ComplaintService complaintService;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:mohankanthmaddina1784@gmail.com}")
    private String supportEmail;

    @GetMapping("/support-email")
    public ResponseEntity<Map<String, String>> getSupportEmail() {
        Map<String, String> response = new HashMap<>();
        response.put("email", supportEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        List<Order> orders = orderService.getUserOrders(user);

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("orderCount", orders.size());
        // For security, remove password from response if present (though User model
        // might have it)
        // Usually, a DTO would be better, but we'll stick to the model for now if it's
        // safe.

        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestParam Long userId, @RequestBody User profileData) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (profileData.getName() != null)
            user.setName(profileData.getName());
        // Add other fields if necessary

        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/orders/{orderId}/complaint")
    public ResponseEntity<?> submitComplaint(
            @PathVariable Long orderId,
            @RequestParam Long userId,
            @RequestParam(required = false) Long productId,
            @RequestBody Map<String, String> complaintData) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Optional<Order> orderOpt = orderService.getOrderById(orderId, userOpt.get());
        if (orderOpt.isEmpty())
            return ResponseEntity.notFound().build();

        String issueType = complaintData.get("issueType");
        String description = complaintData.get("description");

        com.example.buildpro.model.Product product = null;
        if (productId != null) {
            product = orderOpt.get().getOrderItems().stream()
                    .map(com.example.buildpro.model.OrderItem::getProduct)
                    .filter(p -> p.getId().equals(productId))
                    .findFirst()
                    .orElse(null);
        }

        complaintService.submitComplaint(userOpt.get(), orderOpt.get(), product, issueType, description);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Complaint submitted successfully");
        return ResponseEntity.ok(response);
    }
}
