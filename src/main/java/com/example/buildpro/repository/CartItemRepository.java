package com.example.buildpro.repository;

import com.example.buildpro.model.CartItem;
import com.example.buildpro.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    void deleteByCart(Cart cart);
}
