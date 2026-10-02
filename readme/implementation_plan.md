# Project Directory Structure Optimization & Refactoring

This plan outlines the restructuring of the PySpark Data Analytics module (`Model/`) and the overall project layout to follow industry best practices, standard PEP 8 conventions, clean package imports, and environment-driven configurations.

---

## 📐 Current Structure vs. Proposed Standardized Structure

### Current Layout Issues
1. **PEP 8 Non-compliance**: Folders (`Config/`, `Entity/`, `Models/`) and files (`DBConnection.py`, `User_Activity.py`, `Cart.py`, etc.) use PascalCase/Capitalized names instead of standard Python `snake_case`.
2. **Confusing Folder Collisions**: Outer folder `Model/` contains a subfolder `Models/` (`Model/Models/`), causing ambiguity.
3. **Brittle Imports**: Modules use `sys.path.append(...)` hacks to locate parent and sibling directories.
4. **Hardcoded Credentials & Paths**: Database URLs, credentials, and local JAR paths are hardcoded inside source files.
5. **Missing Entry Point & Dependency Specification**: Lacks a clean `main.py` execution entry point and a `requirements.txt` file.

---

## 🛠️ Proposed Directory Architecture

```text
E-commerce-Website-for-Construction-Materials/
├── src/                               # Spring Boot Backend (Java Maven)
├── frontend/                          # React Frontend (Vite)
└── Model/                             # PySpark Data Analytics & Engineering Subsystem
    ├── main.py                        # [NEW] Entry point for PySpark pipeline
    ├── requirements.txt               # [NEW] Python dependencies (pyspark, python-dotenv)
    ├── config/                        # Database & Spark Session Configurations
    │   ├── __init__.py
    │   └── db_connection.py           # [RENAMED] Environment-aware DB connection manager
    ├── entities/                      # PySpark Data Model Entities
    │   ├── __init__.py
    │   ├── cart.py                    # [RENAMED] Cart Data Model
    │   ├── categories.py              # [RENAMED] Categories Data Model
    │   ├── otps.py                    # [RENAMED] OTP Codes Data Model
    │   ├── products.py                # [RENAMED] Products Data Model
    │   └── users.py                   # [RENAMED] Users Data Model
    └── analytics/                     # Data Analytics & Aggregation Pipelines
        ├── __init__.py
        └── user_activity.py           # [RENAMED] User Activity analytics pipeline
```

---

## 📝 User Review Required

> [!IMPORTANT]
> - Renaming `Model/Entity` to `Model/entities`, `Model/Models` to `Model/analytics`, and converting Python files to `snake_case` will improve maintainability and follow Python PEP 8 standards.
> - The class `User_Activity` will be updated to standard PascalCase `UserActivity`.
> - If any external scripts depend on importing `Entity.Products` directly, they will now import from `entities.products`.

---

## 🔄 Proposed Changes

### Component: `Model` (PySpark Analytics Module)

#### [NEW] [main.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/main.py)
- Create a clean main execution script to run PySpark analytics jobs.

#### [NEW] [requirements.txt](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/requirements.txt)
- Create requirements file specifying `pyspark` and `python-dotenv`.

#### [DELETE] `Model/Config/DBConnection.py` -> [NEW] [db_connection.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/config/db_connection.py)
- Rename to `config/db_connection.py`.
- Add environment variable lookup for database credentials, host, port, and MySQL connector JAR path.

#### [DELETE] `Model/Entity/*` -> [NEW] `Model/entities/*`
- [cart.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/entities/cart.py)
- [categories.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/entities/categories.py)
- [otps.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/entities/otps.py)
- [products.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/entities/products.py)
- [users.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/entities/users.py)
- Replace `sys.path.append` with clean relative/package imports.

#### [DELETE] `Model/Models/User_Activity.py` -> [NEW] [user_activity.py](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/Model/analytics/user_activity.py)
- Rename folder to `analytics` and file to `user_activity.py`.
- Rename class `User_Activity` to `UserActivity`.
- Clean up imports.

---

### Component: Documentation

#### [MODIFY] [README.md](file:///c:/Users/mohankanthmaddina/Desktop/New%20folder%20%282%29/E-commerce/E-commerce-Website-for-Construction/E-commerce-Website-for-Construction-Materials-Java-Full-Stack-Web-Application/README.md)
- Update the tree layout in `README.md` to reflect the updated `Model/` directory structure.

---

## 🧪 Verification Plan

### Automated / Syntax Verification
- Execute `python -m py_compile` on all newly structured Python files to ensure zero syntax errors or broken imports.

### Manual Verification
- Test running `python main.py` or `python analytics/user_activity.py` inside the `Model/` directory to verify PySpark imports resolution.
