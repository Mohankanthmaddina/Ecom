package com.example.buildpro.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.buildpro.dto.OrderDTO;
import com.example.buildpro.model.Order;
import com.example.buildpro.model.OrderItem;
import com.example.buildpro.model.Product;
import com.example.buildpro.repository.OrderItemRepository;
import com.example.buildpro.repository.OrderRepository;
import com.example.buildpro.repository.ProductRepository;
import com.example.buildpro.service.AdminService;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> debugOrders() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Get all orders
            List<Order> orders = orderRepository.findAll();
            result.put("totalOrders", orders.size());

            // Get all order items
            List<OrderItem> orderItems = orderItemRepository.findAll();
            result.put("totalOrderItems", orderItems.size());

            // Get all products
            List<Product> products = productRepository.findAll();
            result.put("totalProducts", products.size());

            // Check each order for items
            Map<String, Object> orderDetails = new HashMap<>();
            for (Order order : orders) {
                Map<String, Object> orderInfo = new HashMap<>();
                orderInfo.put("id", order.getId());
                orderInfo.put("userName", order.getUser() != null ? order.getUser().getName() : "No User");
                orderInfo.put("orderItemsCount", order.getOrderItems() != null ? order.getOrderItems().size() : 0);
                orderInfo.put("totalAmount", order.getTotalAmount());
                orderInfo.put("status", order.getStatus());

                // Check order items
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    List<Map<String, Object>> itemsInfo = new java.util.ArrayList<>();
                    for (OrderItem item : order.getOrderItems()) {
                        Map<String, Object> itemInfo = new HashMap<>();
                        itemInfo.put("id", item.getId());
                        itemInfo.put("productId", item.getProduct() != null ? item.getProduct().getId() : "NULL");
                        itemInfo.put("productName", item.getProduct() != null ? item.getProduct().getName() : "NULL");
                        itemInfo.put("quantity", item.getQuantity());
                        itemInfo.put("price", item.getPrice());
                        itemInfo.put("subtotal", item.getSubtotal());
                        itemsInfo.add(itemInfo);
                    }
                    orderInfo.put("items", itemsInfo);
                } else {
                    orderInfo.put("items", "No items found");
                }

                orderDetails.put("order_" + order.getId(), orderInfo);
            }

            result.put("orders", orderDetails);
            result.put("success", true);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> debugDatabase() {
        Map<String, Object> result = new HashMap<>();

        try {
            // Test database connection
            long orderCount = orderRepository.count();
            long orderItemCount = orderItemRepository.count();
            long productCount = productRepository.count();

            result.put("success", true);
            result.put("orderCount", orderCount);
            result.put("orderItemCount", orderItemCount);
            result.put("productCount", productCount);
            result.put("message", "Database connection successful");

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin-service/{id}")
    public ResponseEntity<Map<String, Object>> debugAdminService(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("Testing AdminService for order ID: " + id);
            OrderDTO orderDTO = adminService.getOrderDTOById(id);

            if (orderDTO == null) {
                result.put("success", false);
                result.put("error", "AdminService returned null for order ID: " + id);
                return ResponseEntity.ok(result);
            }

            result.put("success", true);
            result.put("orderId", orderDTO.getId());
            result.put("userName", orderDTO.getUserName());
            result.put("userEmail", orderDTO.getUserEmail());
            result.put("totalAmount", orderDTO.getTotalAmount());
            result.put("status", orderDTO.getStatus());
            result.put("orderItemsCount", orderDTO.getOrderItems() != null ? orderDTO.getOrderItems().size() : 0);

            if (orderDTO.getOrderItems() != null && !orderDTO.getOrderItems().isEmpty()) {
                List<Map<String, Object>> itemsInfo = new java.util.ArrayList<>();
                for (var item : orderDTO.getOrderItems()) {
                    Map<String, Object> itemInfo = new HashMap<>();
                    itemInfo.put("itemId", item.getId());
                    itemInfo.put("productId", item.getProductId());
                    itemInfo.put("productName", item.getProductName());
                    itemInfo.put("productBrand", item.getProductBrand());
                    itemInfo.put("quantity", item.getQuantity());
                    itemInfo.put("price", item.getPrice());
                    itemInfo.put("subtotal", item.getSubtotal());
                    itemsInfo.add(itemInfo);
                }
                result.put("orderItems", itemsInfo);
            } else {
                result.put("orderItems", "No items found");
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> debugOrderById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();

        try {
            Order order = orderRepository.findById(id).orElse(null);
            if (order == null) {
                result.put("success", false);
                result.put("error", "Order not found with ID: " + id);
                return ResponseEntity.ok(result);
            }

            result.put("orderId", order.getId());
            result.put("userName", order.getUser() != null ? order.getUser().getName() : "No User");
            result.put("userEmail", order.getUser() != null ? order.getUser().getEmail() : "No Email");
            result.put("totalAmount", order.getTotalAmount());
            result.put("status", order.getStatus());
            result.put("orderDate", order.getOrderDate());

            // Check order items
            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                result.put("orderItemsCount", order.getOrderItems().size());
                List<Map<String, Object>> itemsInfo = new java.util.ArrayList<>();

                for (OrderItem item : order.getOrderItems()) {
                    Map<String, Object> itemInfo = new HashMap<>();
                    itemInfo.put("itemId", item.getId());
                    itemInfo.put("productId", item.getProduct() != null ? item.getProduct().getId() : "NULL");
                    itemInfo.put("productName", item.getProduct() != null ? item.getProduct().getName() : "NULL");
                    itemInfo.put("productBrand", item.getProduct() != null ? item.getProduct().getBrand() : "NULL");
                    itemInfo.put("quantity", item.getQuantity());
                    itemInfo.put("price", item.getPrice());
                    itemInfo.put("subtotal", item.getSubtotal());
                    itemsInfo.add(itemInfo);
                }
                result.put("orderItems", itemsInfo);
            } else {
                result.put("orderItemsCount", 0);
                result.put("orderItems", "No items found");
            }

            result.put("success", true);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/user-orders/{userId}")
    public ResponseEntity<Map<String, Object>> debugUserOrders(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("=== DEBUG USER ORDERS ===");
            System.out.println("Fetching orders for user ID: " + userId);

            // Test AdminService method
            List<OrderDTO> userOrders = adminService.getOrdersByUserId(userId);

            result.put("success", true);
            result.put("userId", userId);
            result.put("ordersCount", userOrders.size());
            result.put("orders", userOrders);

            System.out.println("✅ Found " + userOrders.size() + " orders for user ID: " + userId);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/order-details/{orderId}")
    public ResponseEntity<Map<String, Object>> debugOrderDetails(@PathVariable Long orderId) {
        Map<String, Object> result = new HashMap<>();

        try {
            System.out.println("=== DEBUG ORDER DETAILS ===");
            System.out.println("Testing order details for order ID: " + orderId);

            // Test AdminService method
            OrderDTO orderDTO = adminService.getOrderDTOById(orderId);

            if (orderDTO == null) {
                result.put("success", false);
                result.put("error", "Order not found with ID: " + orderId);
                return ResponseEntity.ok(result);
            }

            result.put("success", true);
            result.put("orderId", orderDTO.getId());
            result.put("userName", orderDTO.getUserName());
            result.put("userEmail", orderDTO.getUserEmail());
            result.put("totalAmount", orderDTO.getTotalAmount());
            result.put("status", orderDTO.getStatus());
            result.put("orderItemsCount", orderDTO.getOrderItems() != null ? orderDTO.getOrderItems().size() : 0);

            if (orderDTO.getOrderItems() != null && !orderDTO.getOrderItems().isEmpty()) {
                List<Map<String, Object>> itemsInfo = new java.util.ArrayList<>();
                for (var item : orderDTO.getOrderItems()) {
                    Map<String, Object> itemInfo = new HashMap<>();
                    itemInfo.put("itemId", item.getId());
                    itemInfo.put("productId", item.getProductId());
                    itemInfo.put("productName", item.getProductName());
                    itemInfo.put("productBrand", item.getProductBrand());
                    itemInfo.put("quantity", item.getQuantity());
                    itemInfo.put("price", item.getPrice());
                    itemInfo.put("subtotal", item.getSubtotal());
                    itemsInfo.add(itemInfo);
                }
                result.put("orderItems", itemsInfo);
            } else {
                result.put("orderItems", "No items found");
            }

            System.out.println("✅ Order details loaded successfully for order ID: " + orderId);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/create-test-order")
    public ResponseEntity<Map<String, Object>> createTestOrder() {
        Map<String, Object> result = new HashMap<>();

        try {
            // This is a simple test to create sample data if none exists
            // You would need to implement proper order creation logic
            result.put("success", true);
            result.put("message", "Test order creation endpoint - implement order creation logic here");
            result.put("note", "Check if you have orders in the database first using /debug/orders");

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(result);
    }
}
