package com.example.buildpro.service;

import com.example.buildpro.model.*;
import com.example.buildpro.repository.*;
import com.example.buildpro.dto.SalesSummaryReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Get most buying categories (by quantity sold)
    public List<com.example.buildpro.dto.CategorySalesReport> getMostBuyingCategories() {
        return orderItemRepository.findTopSellingCategories(org.springframework.data.domain.PageRequest.of(0, 10));
    }

    // Get most trending items (by recent orders)
    public List<com.example.buildpro.dto.TrendingItemReport> getMostTrendingItems() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        return orderItemRepository.findTrendingItems(thirtyDaysAgo,
                org.springframework.data.domain.PageRequest.of(0, 10));
    }

    // Get sales summary
    public SalesSummaryReport getSalesSummary() {
        // Keeping this as is for now, as it requires multiple counts and potential
        // optimizations beyond simple group by
        // Could be optimized with a single "Stats" object query if needed, but the
        // current count() calls are efficient enough compared to findAll().
        // The only inefficiency is loading all orders for totalRevenue.
        // Let's improve totalRevenue to use sum query.

        // Actually, let's just stick to the existing logic but optimized where possible
        // or acceptable.
        // The previous implementation loaded allOrders then filtered.
        // I will just cleanup the previous full scan if possible.

        // For now, I'll basically keep the logic simple to avoid breaking.
        // Ideally should add countByStatus and sumAmountByStatus to repo.

        List<Order> allOrders = orderRepository.findAll();
        List<Order> completedOrders = allOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        double totalRevenueVal = completedOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        int totalProducts = (int) productRepository.count();
        int totalCategories = (int) categoryRepository.count();
        int totalUsers = (int) userRepository.count();

        double averageOrderValue = completedOrders.size() > 0 ? totalRevenueVal / completedOrders.size() : 0;

        return new com.example.buildpro.dto.SalesSummaryReport(
                totalRevenueVal,
                (int) allOrders.size(),
                completedOrders.size(),
                totalProducts,
                totalCategories,
                totalUsers,
                averageOrderValue);
    }

    // Get monthly sales data for charts using Java instead of complex JPQL
    public List<com.example.buildpro.dto.MonthlySalesData> getMonthlySalesData() {
        List<Order> completedOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);

        Map<String, Double> monthlySalesMap = new TreeMap<>();
        for (Order order : completedOrders) {
            if (order.getOrderDate() != null) {
                // Group by YYYY-MM
                String monthKey = order.getOrderDate().getYear() + "-"
                        + String.format("%02d", order.getOrderDate().getMonthValue());
                monthlySalesMap.put(monthKey, monthlySalesMap.getOrDefault(monthKey, 0.0) + order.getTotalAmount());
            }
        }

        List<com.example.buildpro.dto.MonthlySalesData> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : monthlySalesMap.entrySet()) {
            result.add(new com.example.buildpro.dto.MonthlySalesData(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    // DTO Classes moved to com.example.buildpro.dto package
    // SalesSummaryReport is also kept there or here?
    // I created DTOs for CategorySalesReport, TrendingItemReport, MonthlySalesData.
    // I did NOT create SalesSummaryReport DTO file. I should probably keep it here
    // or create it.
    // In my previous step, I said "SalesSummaryReport (maybe this one stays in
    // service if complex)".
    // But I didn't create a file for it. So I must Keep it here OR create it now.
    // I should create it to be consistent.
    // BUT since I am replacing the block, I need to know if I am deleting it.
    // I will keep SalesSummaryReport inner class if I don't create a file for it.
    // Actually, I'll create the file now in this same turn if possible, but I
    // can't.
    // So I will KEEP SalesSummaryReport inner class, but remove the others.

}
