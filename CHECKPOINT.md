# 📍 Project Checkpoint

**Project**: E-Commerce System (Multi-Vendor / Shopee-like)
**Plan Reference**: `nextjs_ecommerce_plan_v2.md`
**Last Updated**: 2026-05-01 (All phases complete ✅)
**Stack**: Next.js 16.2.4 · React 19.2.4 · TiDB Cloud · Tailwind CSS v4 · mysql2 (raw SQL, no ORM)

---

## 🚦 Phase Progress

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Environment Setup | ✅ Done |
| **Phase 1** | Project Initialization | ✅ Done |
| **Phase 2** | Authentication | ✅ Done |
| **Phase 3** | Product System | ✅ Done |
| **Phase 4** | Cart & Orders | ✅ Done |
| **Phase 5** | Dashboards | ✅ Done |
| **Phase 6** | Reviews | ✅ Done |

---

## ✅ Phase 0 — Environment Setup

- [x] TiDB Cloud cluster connected
- [x] Database `ecommerce_db` created
- [x] All 10 schema tables created manually via TiDB SQL Editor

### Tables in `ecommerce_db`

| Domain | Table | Notes |
|---|---|---|
| User & Access | `role_table` | Seeded: admin, seller, customer |
| User & Access | `profile_table` | — |
| Seller / Store | `store_table` | — |
| Product Catalog | `category_table` | — |
| Product Catalog | `product_table` | + price, stock, image_url (alter_tables.js) |
| Cart | `cart_table` | — |
| Cart | `cart_items_table` | Added via migrate_cart_orders.js |
| Order | `order_table` | — |
| Order | `order_items_table` | Added via migrate_cart_orders.js |
| Payment | `payment_table` | + amount (alter_tables.js) |
| Shipping | `shipment_table` | — |
| Review | `review_table` | — |

---

## ✅ Phase 1 — Project Initialization

- [x] Next.js 16.2.4 with App Router
- [x] `mysql2`, `bcryptjs`, `jsonwebtoken` installed
- [x] Tailwind CSS v4 via `@tailwindcss/postcss`
- [x] `lib/db.js` — TiDB pool (keep-alive + idleTimeout)
- [x] `.env.local` — TiDB credentials + `JWT_SECRET`
- [x] `AGENTS.md` — Fullstack agent skill
- [x] `setup_db.js` — DDL bootstrap

---

## ✅ Phase 2 — Authentication

- [x] `lib/auth.js` — JWT sign/verify + HttpOnly cookie (`ecom_session`, 7d)
- [x] `proxy.js` — Role-based route protection (Next.js 16)
- [x] `seed_roles.js` — Seeds admin/seller/customer (run once)
- [x] Roles in DB: `admin(1)`, `seller(2)`, `customer(3)`

| File | Purpose |
|---|---|
| `app/api/auth/register/route.js` | POST: validate → hash → insert |
| `app/api/auth/login/route.js` | POST: verify pw → return JWT cookie |
| `app/api/auth/logout/route.js` | POST: clear cookie |
| `app/api/auth/me/route.js` | GET: decode cookie → return user |
| `app/(auth)/register/page.js` | Register form UI |
| `app/(auth)/login/page.js` | Login form (Suspense for useSearchParams) |

### Route Protection (`proxy.js`)

| Route | Requires |
|---|---|
| `/seller/*` | Login + `seller` role |
| `/admin/*` | Login + `admin` role |
| `/cart/*`, `/checkout/*`, `/orders/*` | Login |
| `/login`, `/register` | Redirect away if already logged in |

---

## ✅ Phase 3 — Product System

- [x] `alter_tables.js` — Added `price`, `stock`, `image_url` → `product_table`; `amount` → `payment_table`
- [x] `services/products.js` — getProducts, getProductById, createProduct, updateProduct, deleteProduct
- [x] `services/categories.js` — getCategories, getCategoryById

| File | Purpose |
|---|---|
| `app/api/products/route.js` | GET (filters) + POST (seller only) |
| `app/api/products/[id]/route.js` | GET + PUT + DELETE (ownership check) |
| `app/api/categories/route.js` | GET all categories |
| `components/ui/ProductCard.js` | Card: image, category, store, price, badge |
| `components/layout/Navbar.js` | Server Component — reads session |
| `components/layout/NavbarActions.js` | Client Component — logout + role links |
| `app/(shop)/products/page.js` | Product listing + category sidebar |
| `app/(shop)/products/[id]/page.js` | Product detail + dynamic metadata |
| `app/layout.js` | Root layout with Navbar + footer |
| `app/page.js` | Home: hero, category pills, featured grid |

---

## ✅ Phase 4 — Cart & Orders

- [x] `migrate_cart_orders.js` — Created `cart_items_table` + `order_items_table`
- [x] `services/cart.js` — getCartItems, getOrCreateCart, addToCart, updateCartItem, removeCartItem, clearCart
- [x] `services/orders.js` — createOrder (transaction), getOrdersByBuyer, getOrderItems

| File | Purpose |
|---|---|
| `app/api/cart/route.js` | GET cart + total · POST add item |
| `app/api/cart/[id]/route.js` | PUT update qty · DELETE remove item |
| `app/api/orders/route.js` | GET order history · POST checkout |
| `app/(shop)/cart/page.js` | Cart UI — live qty + order summary |
| `app/orders/[id]/page.js` | Order confirmation page |
| `components/ui/AddToCartButton.js` | Qty selector, flash feedback, 401→login |

---

## ✅ Phase 5 — Dashboards

### Seller Dashboard

- [x] `services/stores.js` — getStoreByOwner, createStore, getProductsByStore, getOrdersByStore
- [x] `app/api/stores/mine/route.js` — GET / POST seller's store
- [x] `components/seller/CreateStoreForm.js` — Store setup form (shown if no store yet)
- [x] `app/(seller)/dashboard/layout.js` — Auth guard (seller only) + sidebar
- [x] `app/(seller)/dashboard/page.js` — Stats + products table + recent orders
- [x] `app/(seller)/dashboard/products/new/page.js` — Add product form
- [x] `app/(seller)/dashboard/products/[id]/edit/page.js` — Edit + delete product

### Admin Dashboard

- [x] `services/admin.js` — getAdminStats, getAllUsers, getAllProducts, getAllOrders, updateUserRole
- [x] `app/(admin)/dashboard/layout.js` — Auth guard (admin only) + sidebar
- [x] `app/(admin)/dashboard/page.js` — Stats + users/products/orders tables

---

## ✅ Phase 6 — Reviews (Done)

- [x] `services/reviews.js` — submitReview (duplicate guard), getReviewsByProduct, getProductRating (with breakdown), hasUserReviewed
- [x] `app/api/reviews/route.js` — GET by product_id · POST (customers only, 409 on duplicate)
- [x] `components/ui/ReviewForm.js` — interactive star picker (hover effect) + comment textarea
- [x] `components/ui/ReviewList.js` — Server Component: average badge, bar chart breakdown, review cards
- [x] `components/ui/ReviewSection.js` — Client wrapper: triggers `router.refresh()` after submit
- [x] Product detail page updated — inline rating badge, ReviewList + ReviewSection below product
- [x] ProductCard updated — shows star rating + count (or "No reviews yet")

---

## 🗂️ Current File Structure

```
ecommerce-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js                          ✅
│   │   └── register/page.js                       ✅
│   ├── (shop)/
│   │   ├── cart/page.js                           ✅
│   │   └── products/
│   │       ├── page.js                            ✅ Listing
│   │       └── [id]/page.js                       ✅ Detail
│   ├── (seller)/
│   │   └── dashboard/
│   │       ├── layout.js                          ✅ Auth guard + sidebar
│   │       ├── page.js                            ✅ Overview
│   │       └── products/
│   │           ├── new/page.js                    ✅ Add product
│   │           └── [id]/edit/page.js              ✅ Edit/delete
│   ├── (admin)/
│   │   └── dashboard/
│   │       ├── layout.js                          ✅ Auth guard + sidebar
│   │       └── page.js                            ✅ Stats + tables
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js                     ✅
│   │   │   ├── logout/route.js                    ✅
│   │   │   ├── me/route.js                        ✅
│   │   │   └── register/route.js                  ✅
│   │   ├── cart/
│   │   │   ├── route.js                           ✅
│   │   │   └── [id]/route.js                      ✅
│   │   ├── categories/route.js                    ✅
│   │   ├── orders/route.js                        ✅
│   │   ├── products/
│   │   │   ├── route.js                           ✅
│   │   │   └── [id]/route.js                      ✅
│   │   └── stores/
│   │       └── mine/route.js                      ✅
│   ├── orders/[id]/page.js                        ✅ Order confirmation
│   ├── globals.css                                ✅
│   ├── layout.js                                  ✅ Navbar + footer
│   └── page.js                                    ✅ Home page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.js                              ✅ Server Component
│   │   └── NavbarActions.js                       ✅ Client Component
│   ├── seller/
│   │   └── CreateStoreForm.js                     ✅ Client Component
│   └── ui/
│       ├── AddToCartButton.js                     ✅ Client Component
│       └── ProductCard.js                         ✅
│
├── lib/
│   ├── auth.js                                    ✅ JWT helpers
│   └── db.js                                      ✅ TiDB pool
│
├── services/
│   ├── admin.js                                   ✅
│   ├── cart.js                                    ✅
│   ├── categories.js                              ✅
│   ├── orders.js                                  ✅
│   ├── products.js                                ✅
│   └── stores.js                                  ✅
│
├── alter_tables.js                                ✅ run once
├── migrate_cart_orders.js                         ✅ run once
├── proxy.js                                       ✅ Route protection
├── seed_roles.js                                  ✅ run once
├── setup_db.js                                    ✅ run once
├── AGENTS.md                                      ✅ AI agent skill
├── CHECKPOINT.md                                  ✅ This file
├── ecommerce_schema.md                            📄 Schema reference
├── nextjs_ecommerce_plan_v2.md                   📄 Active plan
└── .env.local                                     ✅ Secrets
```

---

## 🔧 Environment

```
TIDB_HOST     = gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT     = 4000
TIDB_USERNAME = Wa9CWashxS2c45z.root
TIDB_DATABASE = ecommerce_db
JWT_SECRET    = (set in .env.local — change before production)
```

---

## 🛠️ One-Time Setup Scripts (run in order)

```bash
node --env-file=.env.local setup_db.js             # 1. All schema tables
node --env-file=.env.local seed_roles.js            # 2. admin/seller/customer roles
node --env-file=.env.local alter_tables.js          # 3. price/stock/image_url columns
node --env-file=.env.local migrate_cart_orders.js   # 4. cart_items + order_items tables
```

---

## 📝 Key Notes

- **No ORM** — raw SQL via `mysql2` parameterized queries (`?` placeholders)
- **`proxy.js`** replaces `middleware.js` in Next.js 16
- **`params` / `searchParams`** must be `await`-ed in Next.js 16
- **`useSearchParams`** requires `<Suspense>` boundary in Client Components
- Passwords hashed with `bcryptjs` (cost 12)
- JWT in HttpOnly cookie `ecom_session` (7-day expiry)
- Checkout uses a **DB transaction** — atomically checks stock → inserts → deducts
- ECONNRESET on first request is normal on TiDB free tier — pool auto-recovers
- Seller must **create a store first** before listing products
- Admin sees all users/products/orders — role promotion coming in Phase 6+

---

## 🌟 Future Enhancements (Completed)

- [x] **Cloudinary Image Upload**: Added `cloudinary` npm package and `/api/upload` route for sellers to upload product images. Form inputs updated to support file streaming.
- [x] **Admin Role Promotion**: Implemented `PUT /api/admin/users/[id]/role` and added `UserRoleSelect` to the Admin dashboard for instant role modifications.
- [x] **Payment Gateway Integration**: Simulated GCash/PayPal checkout flow (`/checkout/[id]`) with `/api/payments/[id]/complete` processing logic. Order and payment tables accurately reflect 'paid' status.
- [ ] Real-time chat (buyer ↔ seller)
- [ ] Wishlist, discount codes & vouchers
- Mobile app version
