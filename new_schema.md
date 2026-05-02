# 🛒 E-Commerce Database Schema (MySQL)

## 📌 Overview

This document defines the complete database schema for a **multi-vendor e-commerce system** similar to Shopee or Amazon. The schema is organized into modular domains including user management, product catalog, cart, orders, payments, shipping, and reviews.

---

# 🧱 USER & ACCESS DOMAIN

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

---

# 🏪 SELLER / STORE DOMAIN

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

---

# 📦 PRODUCT CATALOG DOMAIN

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

CREATE TABLE product_variant_table (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,

    variant_name VARCHAR(100),
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,

    FOREIGN KEY (product_id) REFERENCES product_table(product_id)
);

CREATE TABLE product_image_table (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,

    FOREIGN KEY (product_id) REFERENCES product_table(product_id)
);
```

---

# 🛒 CART DOMAIN

```sql
CREATE TABLE cart_table (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
);

CREATE TABLE cart_item_table (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (cart_id) REFERENCES cart_table(cart_id),
    FOREIGN KEY (variant_id) REFERENCES product_variant_table(variant_id)
);
```

---

# 📦 ORDER DOMAIN

```sql
CREATE TABLE order_table (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (buyer_id) REFERENCES profile_table(profile_id)
);

CREATE TABLE order_item_table (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,

    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES order_table(order_id),
    FOREIGN KEY (variant_id) REFERENCES product_variant_table(variant_id)
);
```

---

# 💳 PAYMENT DOMAIN

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

---

# 🚚 SHIPPING & ADDRESS DOMAIN

```sql
CREATE TABLE address_table (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,

    full_address TEXT NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(20),

    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
);

CREATE TABLE shipment_table (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    address_id INT NOT NULL,

    courier VARCHAR(50),
    tracking_number VARCHAR(100),

    status ENUM('pending','shipped','delivered') DEFAULT 'pending',

    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES order_table(order_id),
    FOREIGN KEY (address_id) REFERENCES address_table(address_id)
);
```

---

# ⭐ REVIEW DOMAIN

```sql
CREATE TABLE review_table (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    profile_id INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES product_table(product_id),
    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
);
```

---

# 🎟️ VOUCHER / DISCOUNT DOMAIN (OPTIONAL)

```sql
CREATE TABLE voucher_table (
    voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    discount_type ENUM('percent','fixed'),
    discount_value DECIMAL(10,2),
    min_purchase DECIMAL(10,2),
    start_date DATETIME,
    end_date DATETIME
);

CREATE TABLE order_voucher_table (
    order_voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    voucher_id INT NOT NULL,
    discount_amount DECIMAL(10,2),

    FOREIGN KEY (order_id) REFERENCES order_table(order_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher_table(voucher_id)
);
```

---

# 🔗 RELATIONSHIP SUMMARY

* One **Role** → Many **Users**
* One **User** → Many **Stores**
* One **Store** → Many **Products**
* One **Product** → Many **Variants**
* One **User** → One **Cart**
* One **Cart** → Many **Cart Items**
* One **User** → Many **Orders**
* One **Order** → Many **Order Items**
* One **Order** → One **Payment**
* One **Order** → One **Shipment**
* One **User** → Many **Addresses**
* One **Product** → Many **Reviews**

---

# 🧠 Notes

* Uses **foreign keys** to enforce data integrity
* Designed for **multi-vendor scalability**
* Supports **product variations and hierarchical categories**
* Ready for integration with Laravel and Blade frontend

---


---
