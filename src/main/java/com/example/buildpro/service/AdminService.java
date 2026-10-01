
package com.example.buildpro.service;

import com.example.buildpro.model.*;
import com.example.buildpro.dto.OrderDTO;
import com.example.buildpro.dto.OrderItemDTO;
import com.example.buildpro.dto.UserDTO;
import com.example.buildpro.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalCategories", categoryRepository.count());

        // Calculate total revenue
        Integer totalRevenue = (int) orderRepository.findAll().stream()
                .mapToDouble(Order::getFinalAmount)
                .sum();
        stats.put("totalRevenue", totalRevenue);
        // 1% of sales amount as revenue metric
        stats.put("revenueOnePercent", totalRevenue * 0.01);

        // Recent orders count
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        Long recentOrders = orderRepository.findAll().stream()
                .filter(order -> order.getOrderDate().isAfter(lastWeek))
                .count();
        stats.put("recentOrders", recentOrders);

        // Recent orders list (top 5)
        List<Map<String, Object>> recentOrdersList = orderRepository.findAll().stream()
                .sorted((a, b) -> {
                    LocalDateTime da = a.getOrderDate();
                    LocalDateTime db = b.getOrderDate();
                    if (da == null && db == null)
                        return 0;
                    if (da == null)
                        return 1;
                    if (db == null)
                        return -1;
                    return db.compareTo(da);
                })
                .limit(5)
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", o.getId());
                    m.put("userName", o.getUser() != null ? o.getUser().getName() : "-");
                    m.put("finalAmount", o.getFinalAmount());
                    m.put("status", o.getStatus() != null ? o.getStatus().toString() : "-");
                    m.put("orderDate", o.getOrderDate());
                    return m;
                })
                .toList();
        stats.put("recentOrdersList", recentOrdersList);

        // Cart item frequency (most and least occurred)
        try {
            // Load all cart items and aggregate by product name
            List<CartItem> allCartItems = cartItemRepository.findAll();
            Map<String, Long> productCounts = allCartItems.stream()
                    .filter(ci -> ci.getProduct() != null)
                    .collect(Collectors.groupingBy(ci -> ci.getProduct().getName(), Collectors.counting()));

            if (!productCounts.isEmpty()) {
                Map.Entry<String, Long> most = productCounts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .orElse(null);
                Map.Entry<String, Long> least = productCounts.entrySet().stream()
                        .min(Map.Entry.comparingByValue())
                        .orElse(null);

                if (most != null) {
                    stats.put("cartMostProduct", most.getKey());
                    stats.put("cartMostCount", most.getValue());
                }
                if (least != null) {
                    stats.put("cartLeastProduct", least.getKey());
                    stats.put("cartLeastCount", least.getValue());
                }
            }
        } catch (Exception ignored) {
        }

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserVerification(Long userId, Boolean isVerified) {
        return userRepository.findById(userId).map(user -> {
            // Ensure proper boolean conversion
            user.setIsVerified(isVerified != null ? isVerified : false);
            // Let @PreUpdate handle the timestamp automatically
            return userRepository.save(user);
        }).orElse(null);
    }

    public boolean deleteUser(Long userId) {
        try {
            // Get the user once to avoid multiple database calls
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                System.out.println("User not found with ID: " + userId);
                return false;
            }

            User user = userOpt.get();
            System.out.println("Starting cascade delete for user ID: " + userId + " (" + user.getName() + ")");

            // 1. Delete OTP records first (no dependencies)
            try {
                otpRepository.deleteByUser(user);
                System.out.println("✓ Deleted OTP records for user " + userId);
            } catch (Exception e) {
                System.out.println("No OTP records found for user " + userId);
            }

            // 2. Delete cart items first (they reference cart)
            try {
                Optional<Cart> userCart = cartRepository.findByUserId(userId);
                if (userCart.isPresent()) {
                    cartItemRepository.deleteByCart(userCart.get());
                    System.out.println("✓ Deleted cart items for user " + userId);
                } else {
                    System.out.println("No cart found for user " + userId);
                }
            } catch (Exception e) {
                System.out.println("No cart items found for user " + userId);
            }

            // 3. Delete cart (after cart items are deleted)
            try {
                cartRepository.deleteByUser(user);
                System.out.println("✓ Deleted cart for user " + userId);
            } catch (Exception e) {
                System.out.println("No cart to delete for user " + userId);
            }

            // 4. Delete addresses (no dependencies)
            try {
                addressRepository.deleteByUser(user);
                System.out.println("✓ Deleted addresses for user " + userId);
            } catch (Exception e) {
                System.out.println("No addresses found for user " + userId);
            }

            // 5. Delete orders (this will also delete order items due to cascade)
            try {
                List<Order> userOrders = orderRepository.findByUser(user);
                for (Order order : userOrders) {
                    orderRepository.delete(order);
                }
                System.out.println("✓ Deleted " + userOrders.size() + " orders for user " + userId);
            } catch (Exception e) {
                System.out.println("No orders found for user " + userId);
            }

            // 6. Finally delete the user (all dependencies removed)
            userRepository.deleteById(userId);
            System.out.println("✓ Successfully deleted user " + userId + " (" + user.getName() + ")");

            return true;
        } catch (Exception e) {
            System.err.println("Error deleting user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting user: " + e.getMessage());
        }
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            if (status == Order.OrderStatus.DELIVERED) {
                order.setDeliveryDate(LocalDateTime.now());
            }
            Order savedOrder = orderRepository.save(order);
            
            // Send order status update email asynchronously / inside a safe try-catch
            try {
                if (savedOrder.getUser() != null && savedOrder.getUser().getEmail() != null) {
                    String toEmail = savedOrder.getUser().getEmail();
                    String orderNum = savedOrder.getOrderNumber() != null ? savedOrder.getOrderNumber() : savedOrder.getId().toString();
                    String subject = "MegaMart Order Update: Order #" + orderNum + " is " + status;
                    String content = "Dear " + savedOrder.getUser().getName() + ",\n\n" +
                            "Your MegaMart order #" + orderNum + " status has been updated to: " + status + ".\n\n" +
                            "Order Summary:\n" +
                            "---------------------------------------\n" +
                            "Total Amount: ₹" + String.format("%.2f", savedOrder.getTotalAmount()) + "\n" +
                            "Discount: ₹" + String.format("%.2f", savedOrder.getDiscountAmount()) + "\n" +
                            "Final Amount: ₹" + String.format("%.2f", savedOrder.getFinalAmount()) + "\n\n" +
                            "Thank you for choosing MegaMart!\n" +
                            "MegaMart Team";
                    emailService.sendEmail(toEmail, subject, content);
                }
            } catch (Exception e) {
                System.err.println("Failed to send order status update email for order " + savedOrder.getId() + ": " + e.getMessage());
            }
            
            return savedOrder;
        }).orElse(null);
    }

    public boolean deleteOrder(Long orderId) {
        return orderRepository.findById(orderId).map(order -> {
            orderRepository.delete(order);
            return true;
        }).orElse(false);
    }

    public Map<String, Object> getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        List<Order> ordersInPeriod = orderRepository.findByOrderDateBetween(startDate, endDate);

        double totalSales = ordersInPeriod.stream()
                .mapToDouble(Order::getFinalAmount)
                .sum();

        long totalOrders = ordersInPeriod.size();
        long deliveredOrders = ordersInPeriod.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.DELIVERED)
                .count();

        report.put("totalSales", totalSales);
        report.put("totalOrders", totalOrders);
        report.put("deliveredOrders", deliveredOrders);
        report.put("periodStart", startDate);
        report.put("periodEnd", endDate);
        report.put("orders", ordersInPeriod);

        return report;
    }

    public List<OrderDTO> getAllOrdersDTO() {
        return orderRepository.findAll().stream().map(this::convertToOrderDTO).collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByUserId(Long userId) {
        System.out.println("=== ADMIN SERVICE: GET ORDERS BY USER ID ===");
        System.out.println("Fetching orders for user ID: " + userId);

        try {
            // Find user first
            var userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found with ID: " + userId);
                return new ArrayList<>();
            }

            User user = userOpt.get();
            System.out.println("✅ User found: " + user.getName() + " (" + user.getEmail() + ")");

            // Get orders for this user
            List<Order> orders = orderRepository.findByUser(user);
            System.out.println("✅ Found " + orders.size() + " orders for user: " + user.getName());

            // Convert to DTOs
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertToOrderDTO)
                    .collect(Collectors.toList());

            System.out.println("✅ Converted " + orderDTOs.size() + " orders to DTOs");
            return orderDTOs;

        } catch (Exception e) {
            System.err.println("❌ Error fetching orders for user ID " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public OrderDTO getOrderDTOById(Long orderId) {
        System.out.println("=== ADMIN SERVICE DEBUG ===");
        System.out.println("AdminService: Fetching order with ID: " + orderId);

        try {
            var orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                System.out.println("❌ AdminService: Order not found in database for ID: " + orderId);
                return null;
            }

            Order order = orderOpt.get();
            System.out.println("✅ AdminService: Order found - ID: " + order.getId() +
                    ", Items count: " + (order.getOrderItems() != null ? order.getOrderItems().size() : 0));
            System.out.println(
                    "✅ AdminService: Order user: " + (order.getUser() != null ? order.getUser().getName() : "NULL"));
            System.out.println("✅ AdminService: Order total: " + order.getTotalAmount());

            OrderDTO dto = convertToOrderDTO(order);
            System.out.println("✅ AdminService: DTO created successfully");
            return dto;
        } catch (Exception e) {
            System.err.println("❌ AdminService: Error fetching order: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserName(order.getUser() != null ? order.getUser().getName() : "Unknown");
        dto.setUserEmail(order.getUser() != null ? order.getUser().getEmail() : "Unknown");
        dto.setUserMobileNumber(order.getAddress() != null ? order.getAddress().getPhone() : null);
        dto.setAddress(formatAddress(order.getAddress()));
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryCharge(order.getDeliveryCharge());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setFinalAmount(order.getFinalAmount());
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveryDate(order.getDeliveryDate());

        // Format display strings
        dto.setStatusDisplay(order.getStatus() != null ? order.getStatus().toString() : "UNKNOWN");
        dto.setOrderDateDisplay(order.getOrderDate() != null
                ? order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "");
        dto.setDeliveryDateDisplay(order.getDeliveryDate() != null
                ? order.getDeliveryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "");

        // Convert order items - handle null order items
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            dto.setOrderItems(order.getOrderItems().stream()
                    .map(this::convertToOrderItemDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setOrderItems(new ArrayList<>());
        }

        return dto;
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        System.out.println("AdminService: Converting OrderItem - ID: " + orderItem.getId() +
                ", Product: " + (orderItem.getProduct() != null ? orderItem.getProduct().getName() : "NULL"));

        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());

        // Handle null product
        if (orderItem.getProduct() != null) {
            dto.setProductId(orderItem.getProduct().getId());
            dto.setProductName(orderItem.getProduct().getName());
            dto.setProductBrand(orderItem.getProduct().getBrand());
            dto.setProductImage(orderItem.getProduct().getImageUrl());
            dto.setProductDescription(orderItem.getProduct().getDescription());
            dto.setProductSpecifications(orderItem.getProduct().getSpecifications());

            System.out.println("AdminService: Product details - Name: " + orderItem.getProduct().getName() +
                    ", Brand: " + orderItem.getProduct().getBrand() +
                    ", Price: " + orderItem.getPrice() +
                    ", Quantity: " + orderItem.getQuantity());
        } else {
            System.out.println("AdminService: WARNING - Product is NULL for OrderItem ID: " + orderItem.getId());
            dto.setProductName("Product Not Found");
            dto.setProductBrand("Unknown");
        }

        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setSubtotal(orderItem.getSubtotal());
        return dto;
    }

    private String formatAddress(Address address) {
        if (address == null) {
            return "Address not provided";
        }
        return String.format("%s, %s, %s - %s",
                address.getAddressLine1() != null ? address.getAddressLine1() : "",
                address.getCity() != null ? address.getCity() : "",
                address.getState() != null ? address.getState() : "",
                address.getPostalCode() != null ? address.getPostalCode() : "");
    }

    public List<UserDTO> getAllUsersDTO() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.USER)
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserDTOById(Long userId) {
        return userRepository.findById(userId).map(this::convertToUserDTO).orElse(null);
    }

    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        dto.setIsVerified(user.getIsVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        // Format display strings
        dto.setRoleDisplay(user.getRole().toString());
        // Ensure proper boolean handling for display
        boolean isVerified = user.getIsVerified() != null ? user.getIsVerified() : false;
        dto.setStatusDisplay(isVerified ? "Verified" : "Unverified");
        try {
            dto.setCreatedAtDisplay(user.getCreatedAt() != null
                    ? user.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                    : "");
            dto.setUpdatedAtDisplay(user.getUpdatedAt() != null
                    ? user.getUpdatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                    : "");
        } catch (Exception e) {
            System.err.println("Error formatting timestamps: " + e.getMessage());
            dto.setCreatedAtDisplay("");
            dto.setUpdatedAtDisplay("");
        }

        return dto;
    }
}
