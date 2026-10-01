package com.example.buildpro.service;

import com.example.buildpro.model.Order;
import com.example.buildpro.model.User;
import com.example.buildpro.repository.OrderRepository;
import com.example.buildpro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @org.springframework.transaction.annotation.Transactional
    public Order processPayment(Long userId, Long addressId, String paymentMethod, String paymentId) {
        System.out.println("=== PAYMENT SERVICE - processPayment ===");
        System.out.println("User ID: " + userId + ", Method: " + paymentMethod);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use OrderService to create order (Single Source of Truth)
        // This handles stock decrement, cart clearing, and basic calculations
        Order order = orderService.createOrder(user, addressId);

        // Update payment details
        order.setPaymentMethod(paymentMethod);
        order.setPaymentId(paymentId);
        order.setOrderNumber(paymentMethod.equalsIgnoreCase("cod") ? "COD_" + System.currentTimeMillis()
                : "ORD_" + System.currentTimeMillis());

        // Confirm order if payment is successful (or COD)
        order.setStatus(Order.OrderStatus.CONFIRMED);

        return orderRepository.save(order);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public boolean verifyRazorpaySignature(String orderId, String paymentId, String signature, String secret) {
        try {
            String payload = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            System.err.println("Signature verification failed: " + e.getMessage());
            return false;
        }
    }
}