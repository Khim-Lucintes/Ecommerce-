# 🛒 E-Commerce Database Schema (MySQL)

## 📌 Overview
This document defines the complete database schema for a multi-vendor e-commerce system similar to Shopee or Amazon.

---

# USER & ACCESS DOMAIN
```sql
CREATE TABLE role_table (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE profile_table (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role_table(role_id)
);
```

# SELLER / STORE DOMAIN
```sql
CREATE TABLE store_table (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES profile_table(profile_id)
);
```

# PRODUCT CATALOG DOMAIN
```sql
CREATE TABLE category_table (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES category_table(category_id)
);

CREATE TABLE product_table (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES store_table(store_id),
    FOREIGN KEY (category_id) REFERENCES category_table(category_id)
);
```

# CART DOMAIN
```sql
CREATE TABLE cart_table (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
);
```

# ORDER DOMAIN
```sql
CREATE TABLE order_table (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES profile_table(profile_id)
);
```

# PAYMENT DOMAIN
```sql
CREATE TABLE payment_table (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES order_table(order_id)
);
```

# SHIPPING DOMAIN
```sql
CREATE TABLE shipment_table (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    courier VARCHAR(50),
    tracking_number VARCHAR(100),
    status ENUM('pending','shipped','delivered') DEFAULT 'pending',
    FOREIGN KEY (order_id) REFERENCES order_table(order_id)
);
```

# REVIEW DOMAIN
```sql
CREATE TABLE review_table (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    profile_id INT NOT NULL,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product_table(product_id),
    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
);
```
