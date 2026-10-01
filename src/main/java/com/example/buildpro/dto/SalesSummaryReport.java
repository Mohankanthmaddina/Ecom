package com.example.buildpro.dto;

public class SalesSummaryReport {
    private Double totalRevenue;
    private Integer totalOrders;
    private Integer completedOrders;
    private Integer totalProducts;
    private Integer totalCategories;
    private Integer totalUsers;
    private Double averageOrderValue;

    public SalesSummaryReport(Double totalRevenue, Integer totalOrders, Integer completedOrders,
            Integer totalProducts, Integer totalCategories, Integer totalUsers,
            Double averageOrderValue) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.completedOrders = completedOrders;
        this.totalProducts = totalProducts;
        this.totalCategories = totalCategories;
        this.totalUsers = totalUsers;
        this.averageOrderValue = averageOrderValue;
    }

    public SalesSummaryReport() {
    }

    // Getters and setters
    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Integer getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Integer completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Integer getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Integer totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Integer getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(Integer totalCategories) {
        this.totalCategories = totalCategories;
    }

    public Integer getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Integer totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(Double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
}
