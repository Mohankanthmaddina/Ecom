package com.example.buildpro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String productBrand;
    private Integer quantity;
    private Double price;
    private Double subtotal;
    
    // Additional fields for better order display
    private String productDescription;
    private String productSpecifications;
    
    // Constructors
    public OrderItemDTO(Long productId, String productName, Integer quantity, Double price) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.subtotal = price * quantity;
    }
    
    public OrderItemDTO(Long productId, String productName, String productImage, Integer quantity, Double price) {
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.quantity = quantity;
        this.price = price;
        this.subtotal = price * quantity;
    }
    
    // Helper method to calculate subtotal
    public Double getSubtotal() {
        if (price != null && quantity != null) {
            return price * quantity;
        }
        return 0.0;
    }
    
    // Builder pattern for fluent API
    public static OrderItemDTOBuilder builder() {
        return new OrderItemDTOBuilder();
    }
    
    // Builder class
    public static class OrderItemDTOBuilder {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private String productBrand;
        private Integer quantity;
        private Double price;
        private String productDescription;
        private String productSpecifications;
        
        public OrderItemDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public OrderItemDTOBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }
        
        public OrderItemDTOBuilder productName(String productName) {
            this.productName = productName;
            return this;
        }
        
        public OrderItemDTOBuilder productImage(String productImage) {
            this.productImage = productImage;
            return this;
        }
        
        public OrderItemDTOBuilder productBrand(String productBrand) {
            this.productBrand = productBrand;
            return this;
        }
        
        public OrderItemDTOBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }
        
        public OrderItemDTOBuilder price(Double price) {
            this.price = price;
            return this;
        }
        
        public OrderItemDTOBuilder productDescription(String productDescription) {
            this.productDescription = productDescription;
            return this;
        }
        
        public OrderItemDTOBuilder productSpecifications(String productSpecifications) {
            this.productSpecifications = productSpecifications;
            return this;
        }
        
        public OrderItemDTO build() {
            OrderItemDTO orderItemDTO = new OrderItemDTO();
            orderItemDTO.setId(id);
            orderItemDTO.setProductId(productId);
            orderItemDTO.setProductName(productName);
            orderItemDTO.setProductImage(productImage);
            orderItemDTO.setProductBrand(productBrand);
            orderItemDTO.setQuantity(quantity);
            orderItemDTO.setPrice(price);
            orderItemDTO.setProductDescription(productDescription);
            orderItemDTO.setProductSpecifications(productSpecifications);
            orderItemDTO.setSubtotal(price * quantity);
            return orderItemDTO;
        }
    }
    
    // Additional utility methods
    public void incrementQuantity() {
        if (this.quantity != null) {
            this.quantity++;
            this.subtotal = this.price * this.quantity;
        }
    }
    
    public void decrementQuantity() {
        if (this.quantity != null && this.quantity > 1) {
            this.quantity--;
            this.subtotal = this.price * this.quantity;
        }
    }
    
    public void updateQuantity(Integer newQuantity) {
        if (newQuantity != null && newQuantity > 0) {
            this.quantity = newQuantity;
            this.subtotal = this.price * this.quantity;
        }
    }
    
    // Validation method
    public boolean isValid() {
        return productId != null && 
               productName != null && 
               quantity != null && quantity > 0 && 
               price != null && price >= 0;
    }
    
    // Method to create from entity (if you have an OrderItem entity)
    public static OrderItemDTO fromEntity(com.example.buildpro.model.OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }
        
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProduct().getName());
        dto.setProductImage(orderItem.getProduct().getImageUrl());
        dto.setProductBrand(orderItem.getProduct().getBrand());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setSubtotal(orderItem.getSubtotal());
        dto.setProductDescription(orderItem.getProduct().getDescription());
        dto.setProductSpecifications(orderItem.getProduct().getSpecifications());
        
        return dto;
    }
    
    // Method to convert to entity (if needed)
    public com.example.buildpro.model.OrderItem toEntity() {
        com.example.buildpro.model.OrderItem orderItem = new com.example.buildpro.model.OrderItem();
        orderItem.setId(this.id);
        
        // You would need to set the product from repository
        // orderItem.setProduct(productRepository.findById(productId).orElse(null));
        
        orderItem.setQuantity(this.quantity);
        orderItem.setPrice(this.price);
        orderItem.setSubtotal(this.getSubtotal());
        
        return orderItem;
    }
}
