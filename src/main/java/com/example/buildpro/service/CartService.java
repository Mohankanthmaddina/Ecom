package com.example.buildpro.service;

import com.example.buildpro.model.Cart;
import com.example.buildpro.model.CartItem;
import com.example.buildpro.model.Product;
import com.example.buildpro.model.User;
import com.example.buildpro.repository.CartRepository;
import com.example.buildpro.repository.CartItemRepository;
import com.example.buildpro.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Cart getOrCreateCart(User user) {
        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        System.out.println("Cart found for user " + user.getEmail() + ": " + cartOpt.isPresent());
        return cartOpt.orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    public Cart getCartByUser(User user) {
        return cartRepository.findByUser(user)
                .orElse(null); // return null if user has no cart yet
    }

    public Cart addToCart(User user, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                existingItem.setQuantity(existingItem.getQuantity() + quantity);
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                cartItemRepository.save(newItem);
                cart.getCartItems().add(newItem);
            }

            return cartRepository.save(cart);
        }
        return cart;
    }

    public Cart updateCartItemQuantity(User user, Long itemId, Integer quantity) {
        if (quantity < 1) {
            removeFromCart(user, itemId);
            return getOrCreateCart(user);
        }

        Optional<CartItem> itemOpt = cartItemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            // Validate user ownership safely
            if (item.getCart() != null && item.getCart().getUser() != null &&
                    item.getCart().getUser().getId().equals(user.getId())) {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
                return item.getCart();
            }
        }
        return getOrCreateCart(user);
    }

    public Cart removeFromCart(User user, Long itemId) {
        Optional<CartItem> itemOpt = cartItemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            // Validate user ownership safely
            if (item.getCart() != null && item.getCart().getUser() != null &&
                    item.getCart().getUser().getId().equals(user.getId())) {
                cartItemRepository.delete(item);
                return item.getCart();
            }
        }
        return getOrCreateCart(user);
    }

    public Cart clearCart(User user) {
        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteAll(cart.getCartItems());
            cart.getCartItems().clear();
            return cartRepository.save(cart);
        }
        return getOrCreateCart(user);
    }
}
