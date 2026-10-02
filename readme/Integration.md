# Dedicated Analytics Database (MySQL) & Hibernate Entities Integration Plan

This document outlines the design and implementation plan to establish a dedicated **MySQL Analytics Database** (`analytics_db`) for saving PySpark analytics pipeline outputs, and creating the corresponding **Hibernate (JPA) Entities & Repositories** in the Spring Boot backend.

---

## 📐 Key Directives & Requirements
- **Database Engine**: **MySQL** exclusively (No PostgreSQL).
- **Primary Operational Database**: `buildpro_db` (MySQL).
- **Analytics Database**: `analytics_db` (MySQL) — distinct from `buildpro_db`.
- **Auto Creation**: Automatic creation / verification of `analytics_db` if it does not exist before writing pipeline output.

---

## 🏗️ Architectural Overview

```
                          ┌───────────────────────────┐
                          │  MySQL Operational DB     │
                          │  (buildpro_db)            │
                          │  - users, products, carts │
                          └─────────────┬─────────────┘
                                        │
                                        │ Reads Operational Data
                                        ▼
                          ┌───────────────────────────┐
                          │  PySpark Analytics        │
                          │  Engine (Model/)          │
                          │  - UserActivity           │
                          │  - ProductAnalysis        │
                          └─────────────┬─────────────┘
                                        │
                                        │ Auto-Creates & Writes to Analytics DB
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  MySQL Analytics Database (analytics_db)                                     │
│  ├── user_category_preferences                                               │
│  ├── product_trending_analytics                                              │
│  └── analytics_pipeline_runs                                                 │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       │ Mapped via Hibernate JPA Entities
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  Spring Boot Backend                                                         │
│  ├── com.example.buildpro.model.analytics.*                                 │
│  └── com.example.buildpro.repository.analytics.*                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Proposed Changes

### Component 1: PySpark Data Pipeline & Database Management (`Model/`)

#### [MODIFY] [db_connection.py](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/config/db_connection.py)
- Configure MySQL URL for Operational DB (`buildpro_db`) and Analytics DB (`analytics_db`).
- Implement `ensure_analytics_db_exists()` method using MySQL JDBC connection string to execute `CREATE DATABASE IF NOT EXISTS analytics_db`.
- Implement `write_to_analytics_db(df, table_name, mode="overwrite")` helper method.

#### [MODIFY] [user_activity.py](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/analytics/user_activity.py)
- Attach execution timestamp (`calculated_at`) and write `get_preference_Category_df()` results into `user_category_preferences` table in MySQL `analytics_db`.

#### [MODIFY] [product_analysis.py](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/analytics/product_analysis.py)
- Calculate rank and cart count for trending products and write results to `product_trending_analytics` table in MySQL `analytics_db`.

#### [MODIFY] [main.py](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/main.py)
- Orchestrate pipeline execution, automatically ensure `analytics_db` exists, execute data analytics, save DataFrames to MySQL, and record pipeline execution logs in `analytics_pipeline_runs`.

#### [NEW] [schema_analytics.sql](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/scripts/schema_analytics.sql)
- Provide MySQL SQL DDL script for manual creation if needed:
  ```sql
  CREATE DATABASE IF NOT EXISTS analytics_db;
  USE analytics_db;
  ```

---

### Component 2: Hibernate (JPA) Entities & Repositories in Spring Boot (`src/main/java/`)

#### [NEW] [UserCategoryPreference.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/model/analytics/UserCategoryPreference.java)
- Hibernate Entity for `@Table(name = "user_category_preferences")`.
- Fields: `id`, `userId`, `userName`, `categoryId`, `categoryName`, `totalQuantity`, `calculatedAt`.

#### [NEW] [ProductTrendingAnalytics.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/model/analytics/ProductTrendingAnalytics.java)
- Hibernate Entity for `@Table(name = "product_trending_analytics")`.
- Fields: `id`, `productId`, `productName`, `cartCount`, `rankOrder`, `calculatedAt`.

#### [NEW] [AnalyticsPipelineRun.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/model/analytics/AnalyticsPipelineRun.java)
- Hibernate Entity for `@Table(name = "analytics_pipeline_runs")`.
- Fields: `id`, `pipelineName`, `status`, `recordsProcessed`, `startTime`, `endTime`, `errorMessage`.

#### [NEW] [UserCategoryPreferenceRepository.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/repository/analytics/UserCategoryPreferenceRepository.java)
- Spring Data JPA Repository extending `JpaRepository<UserCategoryPreference, Long>`.

#### [NEW] [ProductTrendingAnalyticsRepository.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/repository/analytics/ProductTrendingAnalyticsRepository.java)
- Spring Data JPA Repository extending `JpaRepository<ProductTrendingAnalytics, Long>`.

#### [NEW] [AnalyticsPipelineRunRepository.java](file:///c:/Users/mohankanthmaddina/Desktop/ModelIntegration/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/java/com/example/buildpro/repository/analytics/AnalyticsPipelineRunRepository.java)
- Spring Data JPA Repository extending `JpaRepository<AnalyticsPipelineRun, Long>`.

---

## 🧪 Verification Plan

### Automated / Build Verification
1. Run `mvn clean compile` to ensure Spring Boot compiles cleanly with the new JPA entities and repositories.
2. Verify syntax of updated Python files using `python -m py_compile`.

### Manual Verification
1. Verify `analytics_db` creation logic and schema generation in MySQL.
