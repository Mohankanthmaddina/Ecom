# Implementation Plan: Convert MySQL to PostgreSQL & Data Migration

This document outlines the step-by-step process for converting the BuildPro Spring Boot project from MySQL to PostgreSQL and migrating all existing database records to PostgreSQL.

## User Review Required

> [!IMPORTANT]
> **PostgreSQL Prerequisites**:
> 1. Ensure PostgreSQL server is installed and running on your local machine (or server) on port `5432` (or your preferred port).
> 2. Create an empty database in PostgreSQL (e.g. `buildpro_db`):
>    ```sql
>    CREATE DATABASE buildpro_db;
>    ```

> [!NOTE]
> Standard JPA / Hibernate repositories in this project do not use MySQL-specific native queries, making code transition smooth and clean.

---

## Proposed Changes

### Backend Spring Boot Configuration

#### [MODIFY] [pom.xml](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/pom.xml)
- Replace `com.mysql:mysql-connector-j` dependency with PostgreSQL driver `org.postgresql:postgresql`.

#### [MODIFY] [application.properties](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/src/main/resources/application.properties)
- Change JDBC driver class to `org.postgresql.Driver`.
- Change Hibernate dialect to `org.hibernate.dialect.PostgreSQLDialect`.

#### [MODIFY] [.env](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/.env)
- Update `DB_URL` connection string format:
  `DB_URL=jdbc:postgresql://localhost:5432/buildpro_db`
- Update `DB_USERNAME` and `DB_PASSWORD` for PostgreSQL credentials.

---

## Data Migration Strategies (MySQL -> PostgreSQL)

To migrate all existing data from your MySQL database to PostgreSQL, choose one of the following methods:

### Method 1: Using `pgloader` (Recommended & Fully Automated)
`pgloader` is the standard open-source tool for migrating MySQL to PostgreSQL. It automatically converts schema definitions, data types (e.g., `TINYINT` to `BOOLEAN`, `DATETIME` to `TIMESTAMPTZ`), primary key auto-increments (`SERIAL`/`IDENTITY`), and copies all data in parallel.

**Command**:
```bash
pgloader mysql://root:Mohan123@localhost:3306/buildpro_db postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/buildpro_db
```

*Or via Docker*:
```bash
docker run --rm -it dimitri/pgloader pgloader mysql://root:Mohan123@host.docker.internal:3306/buildpro_db postgresql://postgres:YOUR_PG_PASSWORD@host.docker.internal:5432/buildpro_db
```

---

### Method 2: Schema Auto-Generation (Hibernate) + Data Transfer Script
If `pgloader` is not available, you can let Hibernate create the clean PostgreSQL schema and use a data transfer script/tool.

1. **Start the updated Spring Boot application once** with `spring.jpa.hibernate.ddl-auto=update` to automatically generate all tables in PostgreSQL.
2. **Transfer Data**:
   - **Using DBeaver / DataGrip**: Right-click table(s) in MySQL -> Export Data -> Target: Database (PostgreSQL).
   - **Using Python Script**: Run a data copy script to transfer records table by table.
3. **Reset Sequences**: In PostgreSQL, update primary key sequence counters so new insertions work cleanly:
   ```sql
   SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
   -- Repeat for other auto-increment tables if needed
   ```

---

## Verification Plan

### Automated Tests
- Run `mvn clean compile` to confirm Maven resolves the PostgreSQL driver and project compiles without errors.

### Manual Verification
- Start PostgreSQL instance and check database connection upon Spring Boot application startup (`mvn spring-boot:run`).
- Verify tables and data transferred into PostgreSQL.
