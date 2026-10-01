package com.example.buildpro.repository.analytics;

import com.example.buildpro.model.analytics.ProductTrendingAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTrendingAnalyticsRepository extends JpaRepository<ProductTrendingAnalytics, Long> {

    List<ProductTrendingAnalytics> findAllByOrderByRankOrderAsc();

    Optional<ProductTrendingAnalytics> findByProductId(Long productId);

    List<ProductTrendingAnalytics> findTop10ByOrderByCartCountDesc();
}
