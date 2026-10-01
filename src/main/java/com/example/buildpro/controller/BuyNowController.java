package com.example.buildpro.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.buildpro.model.Address;
import com.example.buildpro.model.Order;
import com.example.buildpro.model.OrderItem;
import com.example.buildpro.model.Product;
import com.example.buildpro.model.User;
import com.example.buildpro.repository.OrderRepository;
import com.example.buildpro.service.AddressService;
import com.example.buildpro.service.PaymentService;
import com.example.buildpro.service.ProductService;
import com.example.buildpro.service.UserService;
import com.razorpay.RazorpayClient;

@Controller
@RequestMapping("/buynow")
public class BuyNowController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentService paymentService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    /**
     * Display Buy Now Checkout Page
     * Shows single product checkout with address selection
     */
    @GetMapping("/checkout")
    public String showBuyNowCheckout(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer quantity,
            Model model) {

        System.out.println("=== BUY NOW CHECKOUT PAGE ===");
        System.out.println("Product ID: " + productId);
        System.out.println("User ID: " + userId);
        System.out.println("Quantity: " + quantity);

        try {
            // Verify user
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return "redirect:/login?error=Please login first";
            }

            // Verify product
            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                return "redirect:/products/view?error=Product not found";
            }

            User user = userOpt.get();
            Product product = productOpt.get();

            // Check stock
            if (product.getStockQuantity() < quantity) {
                return "redirect:/products/view/" + productId + "?error=Insufficient stock";
            }

            // Get user addresses
            List<Address> addresses = addressService.getUserAddresses(user);

            // Calculate pricing
            double subtotal = product.getPrice() * quantity;
            double deliveryCharge = subtotal * 0.05;
            double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
            double total = subtotal + deliveryCharge - discount;

            // Add attributes to model
            model.addAttribute("product", product);
            model.addAttribute("user", user);
            model.addAttribute("addresses", addresses);
            model.addAttribute("quantity", quantity);
            model.addAttribute("subtotal", subtotal);
            model.addAttribute("deliveryCharge", deliveryCharge);
            model.addAttribute("discount", discount);
            model.addAttribute("total", total);
            model.addAttribute("userId", user.getId());
            model.addAttribute("productId", productId);

            System.out.println("✅ Buy Now checkout page loaded successfully");
            return "buy-now-checkout";

        } catch (Exception e) {
            System.err.println("❌ Error loading Buy Now checkout: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/products/view?error=Error loading checkout";
        }
    }

    /**
     * Direct Buy Now - Process COD order immediately
     * This bypasses the cart for immediate purchase
     */
    @GetMapping("/process")
    public String processBuyNow(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam Long addressId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam(defaultValue = "cod") String paymentMethod,
            Model model) {

        System.out.println("=== PROCESSING BUY NOW ORDER ===");
        System.out.println("Product ID: " + productId);
        System.out.println("User ID: " + userId);
        System.out.println("Address ID: " + addressId);
        System.out.println("Quantity: " + quantity);
        System.out.println("Payment Method: " + paymentMethod);

        try {
            // Verify user
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return "redirect:/login?error=User not found";
            }

            // Verify product
            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                return "redirect:/products/view?error=Product not found";
            }

            User user = userOpt.get();
            Product product = productOpt.get();

            // Check stock
            if (product.getStockQuantity() < quantity) {
                return "redirect:/buynow/checkout?productId=" + productId + "&userId=" + userId + "&quantity="
                        + quantity + "&error=Insufficient stock";
            }

            // Get address
            List<Address> addresses = addressService.getUserAddresses(user);
            Address selectedAddress = addresses.stream()
                    .filter(addr -> addr.getId().equals(addressId))
                    .findFirst()
                    .orElse(null);

            if (selectedAddress == null) {
                return "redirect:/buynow/checkout?productId=" + productId + "&userId=" + userId + "&quantity="
                        + quantity + "&error=Please select a delivery address";
            }

            // Calculate pricing
            double subtotal = product.getPrice() * quantity;
            double deliveryCharge = subtotal * 0.05;
            double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
            double total = subtotal + deliveryCharge - discount;

            // Create the order
            Order order = new Order();
            order.setUser(user);
            order.setAddress(selectedAddress);
            order.setPaymentMethod(paymentMethod.toUpperCase());
            order.setOrderNumber("ORD_" + System.currentTimeMillis());
            order.setTotalAmount(subtotal);
            order.setDeliveryCharge(deliveryCharge);
            order.setDiscountAmount(discount);
            order.setFinalAmount(total);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setOrderDate(LocalDateTime.now());

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(subtotal);
            order.getOrderItems().add(orderItem);

            // Save the order
            Order savedOrder = orderRepository.save(order);

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productService.updateProduct(product.getId(), product);

            // Prepare success page data
            model.addAttribute("order", savedOrder);
            model.addAttribute("orderNumber", savedOrder.getOrderNumber());
            model.addAttribute("orderDate", savedOrder.getOrderDate());
            model.addAttribute("finalAmount", total);
            model.addAttribute("product", product);
            model.addAttribute("quantity", quantity);
            model.addAttribute("address", selectedAddress);
            model.addAttribute("subtotal", subtotal);
            model.addAttribute("deliveryCharge", deliveryCharge);
            model.addAttribute("discount", discount);
            model.addAttribute("total", total);
            model.addAttribute("paymentMethod", paymentMethod.toUpperCase());

            System.out.println("✅ Buy Now order created successfully - Order ID: " + savedOrder.getId());
            return "payment-success";

        } catch (Exception e) {
            System.err.println("❌ Error processing Buy Now: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/buynow/checkout?productId=" + productId + "&userId=" + userId + "&quantity=" + quantity
                    + "&error=Error processing order";
        }
    }

    /**
     * Add Address endpoint for Buy Now flow
     * Handles adding new address and redirecting back to checkout
     */
    @PostMapping("/add-address")
    public String addAddress(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam Integer quantity,
            @RequestParam String name,
            @RequestParam String phone,
            @RequestParam String addressLine1,
            @RequestParam(required = false) String addressLine2,
            @RequestParam String city,
            @RequestParam String state,
            @RequestParam String postalCode,
            @RequestParam(defaultValue = "India") String country) {

        System.out.println("=== ADDING ADDRESS FOR BUY NOW ===");
        System.out.println("User ID: " + userId);

        try {
            // Verify user
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return "redirect:/login?error=User not found";
            }

            User user = userOpt.get();

            // Create new address
            Address address = new Address();
            address.setUser(user);
            address.setName(name);
            address.setPhone(phone);
            address.setAddressLine1(addressLine1);
            address.setAddressLine2(addressLine2);
            address.setCity(city);
            address.setState(state);
            address.setPostalCode(postalCode);
            address.setCountry(country);

            // Save address
            addressService.createAddress(user, address);

            System.out.println("✅ Address added successfully");

            // Redirect back to Buy Now checkout
            return "redirect:/buynow/checkout?productId=" + productId
                    + "&userId=" + userId
                    + "&quantity=" + quantity
                    + "&success=Address added successfully";

        } catch (Exception e) {
            System.err.println("❌ Error adding address: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/buynow/checkout?productId=" + productId
                    + "&userId=" + userId
                    + "&quantity=" + quantity
                    + "&error=Error adding address";
        }
    }

    /**
     * Generate Invoice for Buy Now Order
     * Displays a printable invoice page
     */
    @GetMapping("/invoice/{orderId}")
    public String generateInvoice(@PathVariable Long orderId, Model model) {
        System.out.println("=== GENERATING INVOICE FOR ORDER: " + orderId + " ===");

        try {
            // Get order details
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return "redirect:/products/view?error=Order not found";
            }

            Order order = orderOpt.get();

            // Add order details to model
            model.addAttribute("order", order);
            model.addAttribute("orderNumber", order.getOrderNumber());
            model.addAttribute("orderDate", order.getOrderDate());
            model.addAttribute("subtotal", order.getTotalAmount());
            model.addAttribute("deliveryCharge", order.getDeliveryCharge());
            model.addAttribute("discount", order.getDiscountAmount());
            model.addAttribute("total", order.getFinalAmount());
            model.addAttribute("paymentMethod", order.getPaymentMethod());
            model.addAttribute("status", order.getStatus());

            System.out.println("✅ Invoice generated successfully");
            return "invoice";

        } catch (Exception e) {
            System.err.println("❌ Error generating invoice: " + e.getMessage());
            e.printStackTrace();
            return "redirect:/products/view?error=Error generating invoice";
        }
    }

    @PostMapping("/create-razorpay-order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.badRequest().body(response);
            }

            Product product = productOpt.get();

            // Check stock
            if (product.getStockQuantity() < quantity) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Insufficient stock");
                return ResponseEntity.badRequest().body(response);
            }

            // Calculate pricing
            double subtotal = product.getPrice() * quantity;
            double deliveryCharge = subtotal * 0.05;
            double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
            double finalAmount = subtotal + deliveryCharge - discount;

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) Math.round(finalAmount * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_buynow_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", finalAmount);
            response.put("keyId", razorpayKeyId);
            response.put("currency", "INR");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create Razorpay order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/process-online")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processOnlinePayment(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam Long addressId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpaySignature) {

        try {
            // Verify signature
            boolean isValid = paymentService.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId,
                    razorpaySignature, razorpayKeySecret);
            if (!isValid) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Payment signature verification failed");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOpt.get();
            Product product = productOpt.get();

            List<Address> addresses = addressService.getUserAddresses(user);
            Address selectedAddress = addresses.stream()
                    .filter(addr -> addr.getId().equals(addressId))
                    .findFirst()
                    .orElse(null);

            if (selectedAddress == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Address not found");
                return ResponseEntity.badRequest().body(response);
            }

            // Calculate pricing
            double subtotal = product.getPrice() * quantity;
            double deliveryCharge = subtotal * 0.05;
            double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
            double total = subtotal + deliveryCharge - discount;

            // Create the order
            Order order = new Order();
            order.setUser(user);
            order.setAddress(selectedAddress);
            order.setPaymentMethod("ONLINE");
            order.setOrderNumber(razorpayPaymentId); // Using paymentID or custom ID
            order.setTotalAmount(subtotal);
            order.setDeliveryCharge(deliveryCharge);
            order.setDiscountAmount(discount);
            order.setFinalAmount(total);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setOrderDate(LocalDateTime.now());

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(subtotal);
            order.getOrderItems().add(orderItem);

            // Save the order
            Order savedOrder = orderRepository.save(order);

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productService.updateProduct(product.getId(), product);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedOrder.getId());
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("redirectUrl", "/payment/success?orderId=" + savedOrder.getId());
            response.put("message", "Payment successful! Order placed.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/process-cod")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processBuyNowCOD(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestParam Long addressId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        System.out.println("=== PROCESSING BUY NOW COD ORDER (REST) ===");
        System.out.println("Product ID: " + productId);
        System.out.println("User ID: " + userId);
        System.out.println("Address ID: " + addressId);
        System.out.println("Quantity: " + quantity);

        try {
            // Verify user
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            // Verify product
            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOpt.get();
            Product product = productOpt.get();

            // Check stock
            if (product.getStockQuantity() < quantity) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Insufficient stock");
                return ResponseEntity.badRequest().body(response);
            }

            // Get address
            List<Address> addresses = addressService.getUserAddresses(user);
            Address selectedAddress = addresses.stream()
                    .filter(addr -> addr.getId().equals(addressId))
                    .findFirst()
                    .orElse(null);

            if (selectedAddress == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Address not found");
                return ResponseEntity.badRequest().body(response);
            }

            // Calculate pricing
            double subtotal = product.getPrice() * quantity;
            double deliveryCharge = subtotal * 0.05;
            double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
            double total = subtotal + deliveryCharge - discount;

            // Create the order
            Order order = new Order();
            order.setUser(user);
            order.setAddress(selectedAddress);
            order.setPaymentMethod("COD");
            order.setOrderNumber("ORD_" + System.currentTimeMillis());
            order.setTotalAmount(subtotal);
            order.setDeliveryCharge(deliveryCharge);
            order.setDiscountAmount(discount);
            order.setFinalAmount(total);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setOrderDate(LocalDateTime.now());

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(subtotal);
            order.getOrderItems().add(orderItem);

            // Save the order
            Order savedOrder = orderRepository.save(order);

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productService.updateProduct(product.getId(), product);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedOrder.getId());
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("paymentMethod", "Cash on Delivery");
            response.put("redirectUrl", "/payment/success/" + savedOrder.getId());
            response.put("message", "Order placed successfully! You will pay on delivery.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error processing Buy Now COD (REST): " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
