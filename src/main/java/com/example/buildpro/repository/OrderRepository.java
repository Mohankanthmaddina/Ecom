package com.example.buildpro.repository;

import com.example.buildpro.model.Order;
import com.example.buildpro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByUserOrderByOrderDateDesc(User user);

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByStatus(Order.OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.buildpro.dto.MonthlySalesData(CONCAT(YEAR(o.orderDate), '-', MONTH(o.orderDate)), SUM(o.totalAmount)) "
            +
            "FROM Order o " +
            "WHERE o.status = com.example.buildpro.model.Order.OrderStatus.DELIVERED " +
            "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
            "ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
    List<com.example.buildpro.dto.MonthlySalesData> findMonthlySales();
}
