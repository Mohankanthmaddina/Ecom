package com.example.buildpro.dto;

public class CategorySalesReport {
    private String categoryName;
    private Long totalQuantity;
    private Long categoryId;

    public CategorySalesReport(String categoryName, Long totalQuantity, Long categoryId) {
        this.categoryName = categoryName;
        this.totalQuantity = totalQuantity;
        this.categoryId = categoryId;
    }

    public CategorySalesReport() {
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
