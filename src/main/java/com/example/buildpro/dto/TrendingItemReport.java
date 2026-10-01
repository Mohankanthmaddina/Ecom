package com.example.buildpro.dto;

public class TrendingItemReport {
    private String productName;
    private String brand;
    private String categoryName;
    private Long quantitySold;
    private Double price;
    private Long productId;

    public TrendingItemReport(String productName, String brand, String categoryName,
            Long quantitySold, Double price, Long productId) {
        this.productName = productName;
        this.brand = brand;
        this.categoryName = categoryName;
        this.quantitySold = quantitySold;
        this.price = price;
        this.productId = productId;
    }

    public TrendingItemReport() {
    }

    // Getters and setters
    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Long quantitySold) {
        this.quantitySold = quantitySold;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
