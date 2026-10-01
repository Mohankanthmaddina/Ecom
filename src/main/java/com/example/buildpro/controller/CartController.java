package com.example.buildpro.controller;

import com.example.buildpro.dto.CartDTO;
import com.example.buildpro.dto.CartItemDTO;
import com.example.buildpro.model.Cart;
import com.example.buildpro.model.User;
import com.example.buildpro.service.CartService;
import com.example.buildpro.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    // Thymeleaf view for cart page
    @GetMapping("/view")
    public String viewCartPage(@RequestParam Long userId, Model model) {
        Optional<User> userOpt = userService.findById(userId);
        System.out.println("****************************************************************");
        if (userOpt.isEmpty()) {
            return "redirect:/login"; // or handle error properly
        }

        Cart cart = cartService.getOrCreateCart(userOpt.get());
        model.addAttribute("cart", cart);
        model.addAttribute("userId", userId);
        System.out.println("Rendering cart page for userId: " + userId + ", Cart items: ");
        return "cart"; // cart.html (Thymeleaf)
    }

    @GetMapping("/checkout")
    public String checkoutPage(@RequestParam Long userId) {
        System.out.println("Debug - CartController redirecting to checkout with userId: " + userId);
        return "redirect:/checkout?userId=" + userId; // redirect to checkout page with address selection
    }

    // ✅ REST API to get cart for userId
    @GetMapping
    public ResponseEntity<CartDTO> getCart(@RequestParam Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        System.out.println("Fetching cart for userId: " + userId +
                ", User found: " + userOpt.isPresent());

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Cart cart = cartService.getOrCreateCart(user); // Use getOrCreateCart instead

        if (cart == null || cart.getCartItems().isEmpty()) {
            System.out.println("Cart is empty for userId: " + userId);
            CartDTO emptyCart = new CartDTO();
            emptyCart.setCartId(cart != null ? cart.getId() : null);
            emptyCart.setItems(new java.util.ArrayList<>());
            return ResponseEntity.ok(emptyCart);
        }

        // Map Cart -> CartDTO
        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getId());
        cartDTO.setItems(
                cart.getCartItems().stream().map(item -> {
                    CartItemDTO dto = new CartItemDTO();
                    dto.setItemId(item.getId()); // Add CartItem ID
                    dto.setProductId(item.getProduct().getId());
                    dto.setProductName(item.getProduct().getName());
                    dto.setQuantity(item.getQuantity());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setSubtotal(item.getQuantity() * item.getProduct().getPrice());
                    dto.setImageUrl(item.getProduct().getImageUrl());
                    return dto;
                }).toList());

        // Debug print
        cartDTO.getItems().forEach(i -> System.out.println("Item -> " + i.getProductName() +
                ", Qty: " + i.getQuantity() +
                ", Price: " + i.getPrice() +
                ", Subtotal: " + i.getSubtotal()));

        return ResponseEntity.ok(cartDTO);
    }

    // ✅ Add item to cart
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Cart cart = cartService.addToCart(userOpt.get(), productId, quantity);
        return ResponseEntity.ok(cart);
    }

    // ✅ Update cart item quantity
    @PutMapping("/update")
    public ResponseEntity<Cart> updateCartItem(
            @RequestParam Long userId,
            @RequestParam Long itemId,
            @RequestParam Integer quantity) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Cart cart = cartService.updateCartItemQuantity(userOpt.get(), itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    // ✅ Remove item from cart
    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeFromCart(
            @RequestParam Long userId,
            @RequestParam Long itemId) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Cart cart = cartService.removeFromCart(userOpt.get(), itemId);
        return ResponseEntity.ok(cart);
    }

    // ✅ Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Cart> clearCart(@RequestParam Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Cart cart = cartService.clearCart(userOpt.get());
        return ResponseEntity.ok(cart);
    }
}
