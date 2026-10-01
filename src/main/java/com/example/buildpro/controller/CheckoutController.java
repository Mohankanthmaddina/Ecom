package com.example.buildpro.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.buildpro.model.Address;
import com.example.buildpro.model.Cart;
import com.example.buildpro.model.User;
import com.example.buildpro.service.AddressService;
import com.example.buildpro.service.CartService;
import com.example.buildpro.service.UserService;

@Controller
@RequestMapping("/checkout")
public class CheckoutController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @Autowired
    private AddressService addressService;

    @GetMapping
    public String checkoutPage(@RequestParam Long userId, Model model) {
        System.out.println("Debug - CheckoutController received userId: " + userId);
        Optional<User> userOpt = userService.findById(userId);

        if (userOpt.isEmpty()) {
            System.out.println("Debug - User not found for userId: " + userId);
            return "redirect:/login";
        }

        User user = userOpt.get();
        Cart cart = cartService.getCartByUser(user);

        if (cart == null || cart.getCartItems().isEmpty()) {
            return "redirect:/cart/view?userId=" + user.getId();
        }

        // Get user addresses
        List<Address> addresses = addressService.getUserAddresses(user);

        // Calculate totals
        double subtotal = cart.getCartItems().stream()
                .mapToDouble(item -> item.getQuantity() * item.getProduct().getPrice())
                .sum();

        double deliveryCharge = subtotal * 0.05;
        double discount = subtotal > 1000 ? deliveryCharge * 0.15 : 0;
        double total = subtotal + deliveryCharge - discount;

        model.addAttribute("cart", cart);
        model.addAttribute("addresses", addresses);
        model.addAttribute("subtotal", subtotal);
        model.addAttribute("deliveryCharge", deliveryCharge);
        model.addAttribute("discount", discount);
        model.addAttribute("total", total);
        model.addAttribute("userId", user.getId());

        System.out.println("Debug - Added userId to model: " + user.getId());
        System.out.println("Debug - User details - ID: " + user.getId() + ", Email: " + user.getEmail());
        System.out.println("Debug - Model attributes count: " + model.asMap().size());
        System.out.println("Debug - All model attributes: " + model.asMap().keySet());

        return "checkout";
    }

    @PostMapping("/address")
    public String addAddress(@ModelAttribute Address address, @RequestParam Long userId) {
        Optional<User> userOpt = userService.findById(userId);

        if (userOpt.isEmpty()) {
            return "redirect:/login";
        }

        User user = userOpt.get();
        addressService.createAddress(user, address);

        return "redirect:/checkout?userId=" + userId + "&success=Address added successfully";
    }

    @GetMapping("/proceed-to-payment")
    public String proceedToPayment(@RequestParam Long addressId, @RequestParam Long userId) {
        System.out.println("Debug - proceedToPayment called with addressId: " + addressId + ", userId: " + userId);
        System.out.println("Debug - userId type: " + (userId != null ? userId.getClass().getSimpleName() : "null"));

        if (userId == null) {
            System.out.println("Debug - userId is null!");
            return "redirect:/login?error=User ID is required";
        }

        Optional<User> userOpt = userService.findById(userId);
        System.out.println("Debug - UserService.findById result: " + (userOpt.isPresent() ? "FOUND" : "NOT FOUND"));

        if (userOpt.isEmpty()) {
            System.out.println("Debug - User not found for proceedToPayment, userId: " + userId);
            // Let's try to find all users to see what's in the database
            System.out.println("Debug - Checking if any users exist in database...");
            try {
                // This will help us see what users exist
                System.out.println("Debug - Total users in database: " + userService.findAll().size());
                userService.findAll().forEach(
                        u -> System.out.println("Debug - Available user: ID=" + u.getId() + ", Email=" + u.getEmail()));
            } catch (Exception e) {
                System.out.println("Debug - Error checking users: " + e.getMessage());
            }
            return "redirect:/login?error=User not found with ID: " + userId;
        }

        User user = userOpt.get();
        System.out.println(
                "Debug - Found user: ID=" + user.getId() + ", Email=" + user.getEmail() + ", Name=" + user.getName());
        System.out.println("Debug - Redirecting to payment with addressId: " + addressId + ", userId: " + userId);
        // Store selected address in session or pass to payment
        return "redirect:/payment/checkout?addressId=" + addressId + "&userId=" + userId;
    }
}
