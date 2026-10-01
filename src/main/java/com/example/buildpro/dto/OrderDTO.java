package com.example.buildpro.dto;

import com.example.buildpro.model.Order;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String userName;
    private String userEmail;
    private String userMobileNumber;
    private String address;
    private List<OrderItemDTO> orderItems;
    private Double totalAmount;
    private Double deliveryCharge;
    private Double discountAmount;
    private Double finalAmount;
    private Order.OrderStatus status;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private String statusDisplay;
    private String orderDateDisplay;
    private String deliveryDateDisplay;
}