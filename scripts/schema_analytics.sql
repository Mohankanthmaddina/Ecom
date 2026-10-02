-- SQL Initialization Script for MySQL Analytics Database (analytics_db)

CREATE DATABASE IF NOT EXISTS analytics_db;
USE analytics_db;

-- 1. Table for User Category Preferences (calculated by PySpark UserActivity pipeline)
CREATE TABLE IF NOT EXISTS user_category_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    category_id BIGINT NOT NULL,
    category_name VARCHAR(255),
    total_quantity BIGINT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table for Product Trending Analytics (calculated by PySpark ProductAnalysis pipeline)
CREATE TABLE IF NOT EXISTS product_trending_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255),
    cart_count BIGINT NOT NULL,
    rank_order INT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_rank_order (rank_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table for Analytics Pipeline Execution Runs
CREATE TABLE IF NOT EXISTS analytics_pipeline_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pipeline_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    records_processed BIGINT,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    error_message TEXT,
    INDEX idx_pipeline_name (pipeline_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
