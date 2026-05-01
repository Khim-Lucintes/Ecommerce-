# 📍 Project Checkpoint

**Project**: Lazapee (Multi-Vendor Marketplace)
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
| **Phase 7** | Chat · Wishlist · Vouchers · PWA | ✅ Done |

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

## ✅ Phase 7 — Chat · Wishlist · Vouchers · PWA (Done)

### Phase 7: UI Modernization & Shadcn Integration 🟢 (Completed)
**Objective**: Transition the application to a modern, standardized design system using `shadcn/ui` and custom branding.
- [x] Integrate `shadcn/ui` with Next.js 16 and Tailwind v4.
- [x] Set up base components (Button, Card, Input, Label, Badge, Avatar, Table, Progress, etc.).
- [x] Apply custom Lazapee Indigo brand theme (globals.css).
- [x] Refactor Auth Pages (Login, Register) to use Shadcn components.
- [x] Refactor Layout (Navbar, NavbarActions) with Shadcn components.
- [x] Refactor Core UI (Home Page, Product Cards, Cart, AddToCart, ReviewList, ReviewForm).
- [x] Refactor Dashboards (Admin, Seller) to use Table, Card, and Badge components.

### Real-Time Chat (Polling)
- [x] `services/chat.js` — getMessages, sendMessage, markRead, getConversations
- [x] `app/api/chat/route.js` — GET (with read marking) · POST send message
- [x] `components/ui/ChatWindow.js` — floating chat widget, 3-second polling, minimize/maximize, bubble UI
- [x] Product detail page: floating ChatWindow appears for customers chatting with the store owner
- [x] `migrate_phase7.js` — created `messages_table`

### Wishlist
- [x] `services/wishlist.js` — getWishlist, addToWishlist, removeFromWishlist, isWishlisted
- [x] `app/api/wishlist/route.js` — GET · POST · DELETE
- [x] `components/ui/WishlistButton.js` — heart toggle with fill animation + auth redirect
- [x] `app/(shop)/wishlist/page.js` — full wishlist page with out-of-stock overlay
- [x] Navbar: heart icon links to wishlist for customers
- [x] Product detail: WishlistButton added alongside Add to Cart

### Discount Codes & Vouchers
- [x] `services/vouchers.js` — applyVoucher, redeemVoucher, createVoucher, getAllVouchers, toggleVoucher
- [x] `app/api/vouchers/apply/route.js` — POST: validates code, min purchase, expiry, usage limit
- [x] `app/api/admin/vouchers/route.js` — GET list · POST create · PATCH toggle active
- [x] `components/ui/VoucherInput.js` — code input with savings display in cart
- [x] `components/admin/VoucherManagement.js` — create form + management table in Admin Dashboard
- [x] Cart page: VoucherInput integrated into order summary
- [x] `migrate_phase7.js` — created `vouchers_table`

### Progressive Web App (PWA)
- [x] `public/manifest.json` — app name, icons, shortcuts, theme color
- [x] `app/layout.js` — PWA meta tags: manifest link, apple-touch-icon, viewport, mobile-web-app-capable
- [x] App installable from browser on Android/iOS as "Lazapee"

---

## 🗂️ Current File Structure

```
ecommerce-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js                          ✅
│   │   └── register/page.js                       ✅
│   ├── (shop)/
│   │   ├── cart/page.js                           ✅ + VoucherInput
│   │   ├── wishlist/page.js                        ✅ Wishlist page
│   │   └── products/
│   │       ├── page.js                            ✅ Listing
│   │       └── [id]/page.js                       ✅ Detail + Chat + Wishlist
│   ├── (seller)/
│   │   └── dashboard/
│   │       ├── layout.js                          ✅ Auth guard + sidebar
│   │       ├── page.js                            ✅ Overview
│   │       └── products/
│   │           ├── new/page.js                    ✅ Add product + Cloudinary
│   │           └── [id]/edit/page.js              ✅ Edit/delete + Cloudinary
│   ├── seller/dashboard/ ← (actual routes, (seller) group removed)
│   ├── admin/dashboard/  ← (actual routes, (admin) group removed)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── users/[id]/role/route.js           ✅ Role promotion
│   │   │   └── vouchers/route.js                  ✅ Voucher CRUD
│   │   ├── auth/
│   │   │   ├── login/route.js                     ✅
│   │   │   ├── logout/route.js                    ✅
│   │   │   ├── me/route.js                        ✅
│   │   │   └── register/route.js                  ✅
│   │   ├── cart/
│   │   │   ├── route.js                           ✅
│   │   │   └── [id]/route.js                      ✅
│   │   ├── categories/route.js                    ✅
│   │   ├── chat/route.js                          ✅ Real-time polling
│   │   ├── orders/route.js                        ✅
│   │   ├── payments/[id]/complete/route.js        ✅ Payment gateway
│   │   ├── products/
│   │   │   ├── route.js                           ✅
│   │   │   └── [id]/route.js                      ✅
│   │   ├── reviews/route.js                       ✅
│   │   ├── stores/mine/route.js                   ✅
│   │   ├── upload/route.js                        ✅ Cloudinary upload
│   │   └── vouchers/apply/route.js                ✅ Apply voucher
│   ├── orders/[id]/page.js                        ✅ Order confirmation
│   ├── (shop)/checkout/[id]/page.js               ✅ Mock payment page
│   ├── globals.css                                ✅
│   ├── layout.js                                  ✅ Navbar + footer + PWA
│   └── page.js                                    ✅ Home page
│
├── components/
│   ├── admin/
│   │   ├── UserRoleSelect.js                      ✅ Role dropdown
│   │   └── VoucherManagement.js                   ✅ Voucher panel
│   ├── layout/
│   │   ├── Navbar.js                              ✅ Server Component
│   │   └── NavbarActions.js                       ✅ + Wishlist heart
│   ├── seller/
│   │   └── CreateStoreForm.js                     ✅ Client Component
│   └── ui/
│       ├── AddToCartButton.js                     ✅
│       ├── ChatWindow.js                          ✅ Floating chat widget
│       ├── ProductCard.js                         ✅ + star rating
│       ├── ReviewForm.js                          ✅
│       ├── ReviewList.js                          ✅
│       ├── ReviewSection.js                       ✅
│       ├── VoucherInput.js                        ✅
│       └── WishlistButton.js                      ✅
│
├── lib/
│   ├── auth.js                                    ✅ JWT helpers
│   └── db.js                                      ✅ TiDB pool
│
├── services/
│   ├── admin.js                                   ✅
│   ├── cart.js                                    ✅
│   ├── categories.js                              ✅
│   ├── chat.js                                    ✅ Phase 7
│   ├── orders.js                                  ✅
│   ├── products.js                                ✅ + owner_id
│   ├── reviews.js                                 ✅
│   ├── stores.js                                  ✅
│   ├── vouchers.js                                ✅ Phase 7
│   └── wishlist.js                                ✅ Phase 7
│
├── public/
│   └── manifest.json                              ✅ PWA manifest
│
├── alter_tables.js                                ✅ run once
├── migrate_cart_orders.js                         ✅ run once
├── migrate_phase7.js                              ✅ run once
├── proxy.js                                       ✅ Route protection
├── seed_admin.js                                  ✅ run once
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
node --env-file=.env.local seed_roles.js           # 2. admin/seller/customer roles
node --env-file=.env.local seed_admin.js           # 3. creates admin@example.com / pw: admin123
node --env-file=.env.local alter_tables.js         # 4. price/stock/image_url columns
node --env-file=.env.local migrate_cart_orders.js  # 5. cart_items + order_items tables
node --env-file=.env.local migrate_phase7.js       # 6. messages + wishlist + vouchers tables
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
- Admin sees all users/products/orders — role promotion done (Phase 7)
- Chat uses **3-second polling** via `setInterval` — not WebSockets (no infra needed)
- Voucher discount applied client-side in cart display; server-side enforcement is needed before final billing in a real production setting
- PWA requires HTTPS in production for installability; works in dev with Chrome flags
- **File Recovery Note**: On 2026-05-01, several `services/*.js` and `app/api/**` files were inadvertently deleted during a `Remove-Item` glitch. They were manually restored, completing the fix for `Module not found` and `404` errors in the Cart/Admin routes.

---

## 🌟 All Enhancements — Completed ✅

| Feature | Status | Phase |
|---|---|---|
| Cloudinary image uploads | ✅ Done | Phase 6 |
| Admin role promotion | ✅ Done | Phase 6 |
| Payment gateway (mock GCash/PayPal) | ✅ Done | Phase 6 |
| Product reviews & star ratings | ✅ Done | Phase 6 |
| Real-time chat (buyer ↔ seller, polling) | ✅ Done | Phase 7 |
| Wishlist with heart toggle | ✅ Done | Phase 7 |
| Discount codes & vouchers | ✅ Done | Phase 7 |
| Mobile app (PWA manifest) | ✅ Done | Phase 7 |
| Rename to Lazapee | ✅ Done | Phase 7 |
