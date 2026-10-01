package com.example.buildpro.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private Double subtotal;

    // Helper method to calculate subtotal
    public Double getSubtotal() {
        if (price != null && quantity != null) {
            return price * quantity;
        }
        return subtotal != null ? subtotal : 0.0;
    }

    // Helper method to set subtotal automatically
    public void setSubtotal() {
        if (price != null && quantity != null) {
            this.subtotal = price * quantity;
        }
    }
}
