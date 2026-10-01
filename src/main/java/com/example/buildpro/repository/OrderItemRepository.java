package com.example.buildpro.repository;

import com.example.buildpro.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
        // Top selling categories
        @org.springframework.data.jpa.repository.Query("SELECT new com.example.buildpro.dto.CategorySalesReport(p.category.name, SUM(oi.quantity), p.category.id) "
                        +
                        "FROM OrderItem oi JOIN oi.product p " +
                        "GROUP BY p.category.id, p.category.name " +
                        "ORDER BY SUM(oi.quantity) DESC")
        java.util.List<com.example.buildpro.dto.CategorySalesReport> findTopSellingCategories(
                        org.springframework.data.domain.Pageable pageable);

        // Trending items
        @org.springframework.data.jpa.repository.Query("SELECT new com.example.buildpro.dto.TrendingItemReport(p.name, p.brand, p.category.name, SUM(oi.quantity), p.price, p.id) "
                        +
                        "FROM OrderItem oi JOIN oi.product p JOIN oi.order o " +
                        "WHERE o.orderDate > :startDate " +
                        "GROUP BY p.id, p.name, p.brand, p.category.name, p.price " +
                        "ORDER BY SUM(oi.quantity) DESC")
        java.util.List<com.example.buildpro.dto.TrendingItemReport> findTrendingItems(
                        @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
                        org.springframework.data.domain.Pageable pageable);
}
