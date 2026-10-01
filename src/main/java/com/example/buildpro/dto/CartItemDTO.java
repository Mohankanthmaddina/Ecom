package com.example.buildpro.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long itemId; // CartItem ID
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double subtotal;
    private String imageUrl;
}
