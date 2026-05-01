# 🛒 Next.js E-Commerce System Plan (v2)
> School Project — Simplified Edition

## 📌 Overview
A **multi-vendor e-commerce platform** (similar to Shopee) built using Next.js and TiDB Cloud (MySQL-compatible). No ORM — uses raw SQL via `mysql2` for simplicity.

---

# 🧱 Technology Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 14+ (App Router) |
| Database | TiDB Cloud (MySQL-compatible) |
| Database Driver | `mysql2` (raw SQL, no ORM) |
| Authentication | NextAuth v5 or JWT |
| Storage | Cloudinary (free tier) |
| Styling | Tailwind CSS |
| MCP Server | TiDB MCP (Antigravity IDE) |

---

# 🏗️ System Architecture

```
Client (Browser)
    ↓
Next.js App (Frontend + API Routes)
    ↓
lib/db.js (mysql2 connection pool)
    ↓
TiDB Cloud (MySQL-compatible Database)
```

---

# 🗂️ Folder Structure

```
ecommerce-nextjs/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/
│   │   ├── products/
│   │   └── cart/
│   ├── (seller)/
│   │   └── dashboard/
│   ├── (admin)/
│   │   └── dashboard/
│   └── api/
│       ├── auth/
│       ├── products/
│       ├── orders/
│       └── users/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── lib/
│   └── db.js          ← mysql2 connection pool
├── services/          ← SQL query functions
├── hooks/
├── types/
└── styles/
```

---

# 🗄️ Database Tables (TiDB Cloud)

Already created in TiDB Cloud. Tables used in this project:

### users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'seller', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### stores
```sql
CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT,
  name VARCHAR(200),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### products
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT,
  name VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### carts
```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### orders
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10,2),
  status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### order_items
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2)
);
```

### reviews
```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 🔌 Database Connection

```js
// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: Number(process.env.TIDB_PORT),
  user: process.env.TIDB_USERNAME,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: { rejectUnauthorized: true },
});

export default pool;
```

```env
# .env.local
TIDB_HOST=your-host.tidbcloud.com
TIDB_PORT=4000
TIDB_USERNAME=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=ecommerce
```

---

# 🧩 System Modules

## 1. Authentication & Users
- Register / Login
- Role-based access: Admin, Seller, Customer
- Session via NextAuth or JWT

## 2. Store Management
- Seller can create and manage their store
- Store profile page

## 3. Product Management
- CRUD products (Create, Read, Update, Delete)
- Product categories
- Image upload via Cloudinary

## 4. Cart System
- Add / remove items
- Update quantity
- Persist cart in database

## 5. Order System
- Checkout process
- Order history
- Basic order status tracking

## 6. Review System
- Customer can rate and review products
- Display average rating per product

## 7. Admin Dashboard
- View all users, products, orders
- Manage roles

## 8. Seller Dashboard
- View own products and orders

---

# 🔄 Data Flow

```
User Action (UI)
    → Next.js Page / Component
    → API Route (/api/*)
    → lib/db.js (mysql2 pool)
    → TiDB Cloud Database
    → Response back to UI
```

---

# 🚀 Development Phases

## ✅ Phase 0: Environment Setup (Done)
- [x] TiDB Cloud account created
- [x] Database and tables created
- [x] TiDB MCP configured in Antigravity IDE

## 🔲 Phase 1: Project Initialization
- [ ] Create Next.js project (`npx create-next-app@latest`)
- [ ] Install `mysql2` and Tailwind CSS
- [ ] Setup `lib/db.js` connection
- [ ] Configure `.env.local`

## 🔲 Phase 2: Authentication
- [ ] Register page + API route
- [ ] Login page + API route
- [ ] Session/JWT setup
- [ ] Role-based route protection (middleware)

## 🔲 Phase 3: Product System
- [ ] Product listing page
- [ ] Single product page
- [ ] Add/edit/delete product (seller only)
- [ ] Cloudinary image upload

## 🔲 Phase 4: Cart & Orders
- [ ] Add to cart functionality
- [ ] Cart page
- [ ] Checkout page
- [ ] Order confirmation

## 🔲 Phase 5: Dashboards
- [ ] Seller dashboard (products & orders)
- [ ] Admin dashboard (users, products, orders)

## 🔲 Phase 6: Reviews
- [ ] Submit review
- [ ] Display ratings on product page

---

# ⚠️ Challenges

- Authentication flow and session management
- Protecting routes based on user role
- Handling image uploads with Cloudinary
- Managing cart state across pages

---

# 🌟 Future Enhancements (Post-Submission)
- Real-time chat (buyer-seller)
- Wishlist feature
- Discount codes & vouchers
- Mobile app version

---

# 🧠 Notes
- No ORM — use raw SQL with `mysql2` for simplicity
- Keep components reusable and modular
- Separate API logic into `/services` folder
- Use Antigravity IDE + TiDB MCP to generate SQL and API code faster
- Database is already hosted on TiDB Cloud (no local MySQL needed)
