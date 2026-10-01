package com.example.buildpro.model.analytics;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_trending_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTrendingAnalytics {

    @Id
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "cart_count", nullable = false)
    private Long cartCount;

    @Column(name = "rank_order")
    private Integer rankOrder;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;
}
