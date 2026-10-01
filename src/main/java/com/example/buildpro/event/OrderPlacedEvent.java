package com.example.buildpro.event;

import com.example.buildpro.model.User;
import org.springframework.context.ApplicationEvent;

/**
 * Published immediately after an order is saved to the database.
 * Consumed asynchronously by OrderEventListener to run post-order
 * side effects (wallet cashback, notifications) without blocking
 * the HTTP response to the user.
 */
public class OrderPlacedEvent extends ApplicationEvent {

    private final User user;
    private final double discountAmount;

    public OrderPlacedEvent(Object source, User user, double discountAmount) {
        super(source);
        this.user = user;
        this.discountAmount = discountAmount;
    }

    public User getUser() {
        return user;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }
}
