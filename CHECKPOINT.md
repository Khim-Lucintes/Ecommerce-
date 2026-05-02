# 📍 Project Checkpoint

**Project**: Lazapee (Multi-Vendor Marketplace)
**Plan Reference**: `nextjs_ecommerce_plan_v2.md`
**Last Updated**: 2026-05-02
**Stack**: Next.js 16.2.4 · React 19.2.4 · TiDB Cloud (MySQL-compatible) · Tailwind CSS v4 · mysql2 (raw SQL, no ORM)

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
| **Phase 6** | Reviews, Payments & Uploads | ✅ Done |
| **Phase 7** | Chat · Wishlist · Vouchers · PWA | ✅ Done |
| **Phase 8** | Address Management & Schema Polish | ✅ Done |

---

## ✅ Phase 0 — Environment Setup

- [x] TiDB Cloud cluster connected
- [x] Database `ecommerce_db` created
- [x] All schema tables created and migrated

### Tables in `ecommerce_db`

| Domain | Table | Notes |
|---|---|---|
| User & Access | `role_table` | Seeded: admin(1), seller(2), customer(3), superadmin(4) |
| User & Access | `profile_table` | — |
| Seller / Store | `store_table` | — |
| Product Catalog | `category_table` | Seeded via `seed_categories.js` |
| Product Catalog | `product_table` | + price, stock, image_url (alter_tables.js) |
| Product Catalog | `product_variant_table` | Added via migrate_new_schema.js |
| Product Catalog | `product_image_table` | Added via migrate_new_schema.js |
| Cart | `cart_table` | — |
| Cart | `cart_items_table` | Added via migrate_cart_orders.js |
| Cart | `cart_item_table` | Added via migrate_new_schema.js |
| Order | `order_table` | — |
| Order | `order_items_table` | Added via migrate_cart_orders.js |
| Order | `order_item_table` | Added via migrate_new_schema.js |
| Payment | `payment_table` | + amount (alter_tables.js) |
| Shipping | `shipment_table` | + address_id, shipped_at, delivered_at (alter_shipment_table.js) |
| Address | `address_table` | Added via migrate_new_schema.js |
| Review | `review_table` | — |
| Chat | `messages_table` | Added via migrate_phase7.js |
| Wishlist | `wishlist_table` | Added via migrate_phase7.js |
| Vouchers | `vouchers_table` | Added via migrate_phase7.js (legacy) |
| Vouchers | `voucher_table` | Added via migrate_new_schema.js (new schema) |
| Vouchers | `order_voucher_table` | Added via migrate_new_schema.js |

---

## ✅ Phase 1 — Project Initialization

- [x] Next.js 16.2.4 with App Router
- [x] `mysql2`, `bcryptjs`, `jsonwebtoken` installed
- [x] Tailwind CSS v4 via `@tailwindcss/postcss`
- [x] `lib/db.js` — TiDB pool with keep-alive + global dev cache
- [x] `.env.local` — TiDB credentials + `JWT_SECRET`
- [x] `AGENTS.md` — Fullstack agent skill
- [x] `setup_db.js` — DDL bootstrap

---

## ✅ Phase 2 — Authentication

- [x] `lib/auth.js` — JWT sign/verify + HttpOnly cookie (`ecom_session`, 7d)
- [x] `proxy.js` — Role-based route protection (Next.js 16 style)
- [x] `seed_roles.js` — Seeds admin/seller/customer (run once)
- [x] `seed_admin.js` — Creates default admin@lazapee.com account

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
| `/dashboard` | Smart redirect → `/admin/dashboard` or `/seller/dashboard` by role |

---

## ✅ Phase 3 — Product System

- [x] `alter_tables.js` — Added `price`, `stock`, `image_url` → `product_table`; `amount` → `payment_table`
- [x] `seed_categories.js` — Seeds default product categories
- [x] `services/products.js` — getProducts, getProductById, createProduct, updateProduct, deleteProduct
- [x] `services/categories.js` — getCategories, getCategoryById

| File | Purpose |
|---|---|
| `app/api/products/route.js` | GET (filters: q, category, store) + POST (seller only) |
| `app/api/products/[id]/route.js` | GET + PUT + DELETE (ownership check) |
| `app/api/categories/route.js` | GET all categories |
| `components/ui/ProductCard.js` | Card: image, category, store, price, star rating |
| `components/layout/Navbar.js` | Server Component — reads session |
| `components/layout/NavbarActions.js` | Client Component — logout + role links + wishlist |
| `app/(shop)/products/page.js` | Product listing + category sidebar + search |
| `app/(shop)/products/[id]/page.js` | Product detail + add-to-cart + wishlist + chat + reviews |
| `app/layout.js` | Root layout with Navbar + footer + PWA meta |
| `app/page.js` | Home: hero, category pills, featured product grid |

---

## ✅ Phase 4 — Cart & Orders

- [x] `migrate_cart_orders.js` — Created `cart_items_table` + `order_items_table`
- [x] `services/cart.js` — getCartItems, getOrCreateCart, addToCart, updateCartItem, removeCartItem, clearCart
- [x] `services/orders.js` — createOrder (transaction + shipment row), getOrdersByBuyer, getOrderItems, getOrderWithShipment

| File | Purpose |
|---|---|
| `app/api/cart/route.js` | GET cart + total · POST add item |
| `app/api/cart/[id]/route.js` | PUT update qty · DELETE remove item |
| `app/api/orders/route.js` | GET order history · POST checkout (with address_id) |
| `app/(shop)/cart/page.js` | Cart UI — address selector + voucher + order summary |
| `app/(shop)/checkout/[id]/page.js` | Mock payment page (GCash / PayPal) |
| `app/orders/[id]/page.js` | Order confirmation: items + payment + address + shipment |
| `components/ui/AddToCartButton.js` | Qty selector, flash feedback, 401→login redirect |

---

## ✅ Phase 5 — Dashboards

### Seller Dashboard

- [x] `services/stores.js` — getStoreByOwner, createStore, getProductsByStore, getOrdersByStore
- [x] `app/api/stores/mine/route.js` — GET / POST seller's store
- [x] `components/seller/CreateStoreForm.js` — Store setup form (shown if no store yet)
- [x] `app/seller/dashboard/layout.js` — Auth guard (seller only) + sidebar
- [x] `app/seller/dashboard/page.js` — Stats + products table + recent orders
- [x] `app/seller/dashboard/products/new/page.js` — Add product form + Cloudinary upload
- [x] `app/seller/dashboard/products/[id]/edit/page.js` — Edit + delete product

### Admin Dashboard

- [x] `services/admin.js` — getAdminStats, getAllUsers, getAllProducts, getAllOrders, updateUserRole
- [x] `app/api/admin/users/[id]/role/route.js` — PATCH role promotion
- [x] `app/api/admin/vouchers/route.js` — GET list · POST create · PATCH toggle active
- [x] `app/admin/dashboard/layout.js` — Auth guard (admin only) + sidebar
- [x] `app/admin/dashboard/page.js` — Stats cards + users/products/orders tables + voucher panel

### Settings Page

- [x] `app/settings/page.js` — Profile info + seller upgrade button
- [x] `components/settings/UpgradeToSellerButton.js` — Client component for role upgrade

---

## ✅ Phase 6 — Reviews, Payments & Uploads

- [x] `services/reviews.js` — submitReview (duplicate guard), getReviewsByProduct, getProductRating (breakdown), hasUserReviewed
- [x] `app/api/reviews/route.js` — GET by product_id · POST (customers only, 409 on duplicate)
- [x] `app/api/payments/[id]/complete/route.js` — POST: mock payment gateway (GCash / PayPal)
- [x] `app/api/upload/route.js` — POST: Cloudinary upload with local `/public/uploads` fallback
- [x] `components/ui/ReviewForm.js` — Interactive star picker (hover effect) + comment textarea
- [x] `components/ui/ReviewList.js` — Server Component: average badge, bar chart breakdown, review cards
- [x] `components/ui/ReviewSection.js` — Client wrapper: triggers `router.refresh()` after submit

---

## ✅ Phase 7 — Chat · Wishlist · Vouchers · PWA

### UI Modernization (shadcn/ui)
- [x] Integrated `shadcn/ui` with Next.js 16 + Tailwind v4
- [x] Base primitives: Button, Card, Input, Label, Badge, Avatar, Table, Progress, Dialog, Select, Tabs, Sheet, Sonner, Separator, Skeleton, Textarea, Dropdown Menu
- [x] Custom Lazapee Indigo brand theme in `globals.css`
- [x] All pages refactored to use shadcn components

### Real-Time Chat (3-second polling)
- [x] `services/chat.js` — getMessages, sendMessage, markRead, getConversations
- [x] `app/api/chat/route.js` — GET (with read marking) · POST send message
- [x] `components/ui/ChatWindow.js` — Floating chat widget, minimize/maximize, bubble UI
- [x] `migrate_phase7.js` — Created `messages_table`

### Wishlist
- [x] `services/wishlist.js` — getWishlist, addToWishlist, removeFromWishlist, isWishlisted
- [x] `app/api/wishlist/route.js` — GET · POST · DELETE
- [x] `components/ui/WishlistButton.js` — Heart toggle with fill animation + auth redirect
- [x] `app/(shop)/wishlist/page.js` — Full wishlist page with out-of-stock overlay
- [x] `migrate_phase7.js` — Created `wishlist_table`

### Discount Codes & Vouchers
- [x] `services/vouchers.js` — applyVoucher, redeemVoucher, createVoucher, getAllVouchers, toggleVoucher
- [x] `app/api/vouchers/apply/route.js` — POST: validates code, min purchase, expiry, usage limit
- [x] `components/ui/VoucherInput.js` — Code input with savings display in cart
- [x] `components/admin/VoucherManagement.js` — Create form + management table in Admin Dashboard
- [x] `migrate_phase7.js` — Created `vouchers_table`

### Progressive Web App
- [x] `public/manifest.json` — App name, icons, shortcuts, theme color
- [x] PWA meta tags in `app/layout.js` — manifest link, apple-touch-icon, viewport
- [x] App installable from browser on Android / iOS as "Lazapee"

---

## ✅ Phase 8 — Address Management & Schema Polish

### New Schema Applied (`new_schema.md`)
- [x] `migrate_new_schema.js` — Created 7 new tables: `product_variant_table`, `product_image_table`, `cart_item_table`, `order_item_table`, `address_table`, `voucher_table`, `order_voucher_table`
- [x] `alter_shipment_table.js` — Added `address_id` (FK → `address_table`), `shipped_at`, `delivered_at` to `shipment_table`

### Address Management

| File | Purpose |
|---|---|
| `services/addresses.js` | getAddressesByUser, addAddress, deleteAddress |
| `app/api/addresses/route.js` | GET all · POST new address |
| `app/api/addresses/[id]/route.js` | DELETE address (owner-only) |
| `components/ui/AddressSelector.js` | Pick / add / delete delivery address — auto-selects first; blocks checkout if none |

### Checkout & Order Confirmation Updated
- [x] Cart page — `AddressSelector` in Order Summary; `address_id` sent in POST body; blocks checkout if no address
- [x] Orders API — reads `address_id` from request body, passes to `createOrder`
- [x] `services/orders.js` — `createOrder` inserts `shipment_table` row; `getOrderWithShipment` added
- [x] `app/orders/[id]/page.js` — Order confirmation: items, payment status, delivery address, shipment status

---

## 🗂️ Full File Structure

```
ecommerce-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js                             ✅
│   │   └── register/page.js                          ✅
│   ├── (shop)/
│   │   ├── cart/page.js                              ✅ + AddressSelector + VoucherInput
│   │   ├── checkout/[id]/page.js                     ✅ Mock payment (GCash/PayPal)
│   │   ├── wishlist/page.js                          ✅
│   │   └── products/
│   │       ├── page.js                               ✅ Listing + search + category filter
│   │       └── [id]/page.js                          ✅ Detail + Cart + Wishlist + Chat + Reviews
│   ├── seller/dashboard/
│   │   ├── layout.js                                 ✅ Auth guard + sidebar
│   │   ├── page.js                                   ✅ Stats + products + orders
│   │   └── products/
│   │       ├── new/page.js                           ✅ Add product + Cloudinary upload
│   │       └── [id]/edit/page.js                     ✅ Edit / delete + Cloudinary
│   ├── admin/dashboard/
│   │   ├── layout.js                                 ✅ Auth guard + sidebar
│   │   └── page.js                                   ✅ Stats + users + products + orders + vouchers
│   ├── orders/
│   │   ├── page.js                                   ✅ Purchase History list
│   │   └── [id]/page.js                              ✅ Order confirmation
│   ├── settings/page.js                              ✅ Profile info + seller upgrade
│   ├── api/
│   │   ├── addresses/
│   │   │   ├── route.js                              ✅ GET + POST
│   │   │   └── [id]/route.js                         ✅ DELETE
│   │   ├── admin/
│   │   │   ├── users/[id]/role/route.js              ✅ Role promotion
│   │   │   └── vouchers/route.js                     ✅ Voucher CRUD
│   │   ├── auth/
│   │   │   ├── login/route.js                        ✅
│   │   │   ├── logout/route.js                       ✅
│   │   │   ├── me/route.js                           ✅
│   │   │   └── register/route.js                     ✅
│   │   ├── cart/
│   │   │   ├── route.js                              ✅
│   │   │   └── [id]/route.js                         ✅
│   │   ├── categories/route.js                       ✅
│   │   ├── chat/route.js                             ✅ Polling
│   │   ├── orders/route.js                           ✅ + address_id support
│   │   ├── payments/[id]/complete/route.js            ✅ Mock gateway
│   │   ├── products/
│   │   │   ├── route.js                              ✅
│   │   │   └── [id]/route.js                         ✅
│   │   ├── reviews/route.js                          ✅
│   │   ├── stores/mine/route.js                      ✅
│   │   ├── upload/route.js                           ✅ Cloudinary + local fallback
│   │   ├── users/ (misc user endpoints)              ✅
│   │   ├── vouchers/apply/route.js                   ✅
│   │   └── wishlist/route.js                         ✅
│   ├── globals.css                                   ✅ Tailwind v4 + Lazapee Indigo theme
│   ├── layout.js                                     ✅ Navbar + footer + PWA meta + Toaster
│   └── page.js                                       ✅ Home page
│
├── components/
│   ├── admin/
│   │   ├── UserRoleSelect.js                         ✅
│   │   └── VoucherManagement.js                      ✅
│   ├── layout/
│   │   ├── Navbar.js                                 ✅ Server Component
│   │   └── NavbarActions.js                          ✅ + Wishlist heart
│   ├── seller/
│   │   └── CreateStoreForm.js                        ✅
│   ├── settings/
│   │   └── UpgradeToSellerButton.js                  ✅
│   └── ui/
│       ├── AddressSelector.js                        ✅ Phase 8
│       ├── AddToCartButton.js                        ✅
│       ├── ChatWindow.js                             ✅ Floating chat widget
│       ├── ProductCard.js                            ✅ + star rating
│       ├── ReviewForm.js                             ✅
│       ├── ReviewList.js                             ✅
│       ├── ReviewSection.js                          ✅
│       ├── VoucherInput.js                           ✅
│       ├── WishlistButton.js                         ✅
│       └── [shadcn primitives]                       ✅ badge, button, card, dialog,
│                                                        dropdown-menu, input, label,
│                                                        progress, select, separator,
│                                                        sheet, skeleton, sonner,
│                                                        table, tabs, textarea, avatar
│
├── lib/
│   ├── auth.js                                       ✅ JWT helpers
│   ├── db.js                                         ✅ TiDB pool (keep-alive + dev cache)
│   └── utils.js                                      ✅ cn() helper
│
├── services/
│   ├── addresses.js                                  ✅ Phase 8
│   ├── admin.js                                      ✅
│   ├── cart.js                                       ✅
│   ├── categories.js                                 ✅
│   ├── chat.js                                       ✅
│   ├── orders.js                                     ✅ + address_id + getOrderWithShipment
│   ├── products.js                                   ✅
│   ├── reviews.js                                    ✅
│   ├── stores.js                                     ✅
│   ├── vouchers.js                                   ✅
│   └── wishlist.js                                   ✅
│
├── public/
│   └── manifest.json                                 ✅ PWA manifest
│
├── alter_shipment_table.js                           ✅ Phase 8 — run once
├── alter_tables.js                                   ✅ Phase 3 — run once
├── migrate_cart_orders.js                            ✅ Phase 4 — run once
├── migrate_new_schema.js                             ✅ Phase 8 — run once
├── migrate_phase7.js                                 ✅ Phase 7 — run once
├── proxy.js                                          ✅ Route protection (Next.js 16)
├── seed_admin.js                                     ✅ run once
├── seed_categories.js                                ✅ run once
├── seed_roles.js                                     ✅ run once
├── seed_superadmin.js                                ✅ run once
├── setup_db.js                                       ✅ DDL bootstrap
├── drop_columns.js                                   ✅ Drops old schema columns
├── AGENTS.md                                         ✅ AI agent skill file
├── CHECKPOINT.md                                     ✅ This file
├── ecommerce_schema.md                               📄 Old schema reference
├── new_schema.md                                     📄 Updated schema (Phase 8)
├── nextjs_ecommerce_plan_v2.md                       📄 Active plan
└── .env.local                                        ✅ Secrets (never commit)
```

---

## 🔧 Environment Variables

```
TIDB_HOST      = gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT      = 4000
TIDB_USERNAME  = Wa9CWashxS2c45z.root
TIDB_DATABASE  = ecommerce_db
JWT_SECRET     = (set in .env.local — change before production)
CLOUDINARY_*   = (optional — local upload fallback active if missing)
```

---

## 🛠️ One-Time Setup Scripts (run in order)

```bash
node --env-file=.env.local setup_db.js              # 1. Core schema tables
node --env-file=.env.local seed_roles.js            # 2. admin / seller / customer roles
node --env-file=.env.local seed_admin.js            # 3. default admin account
node --env-file=.env.local seed_categories.js       # 4. default product categories
node --env-file=.env.local alter_tables.js          # 5. price/stock/image_url columns
node --env-file=.env.local migrate_cart_orders.js   # 6. cart_items + order_items tables
node --env-file=.env.local migrate_phase7.js        # 7. messages + wishlist + vouchers tables
node --env-file=.env.local migrate_new_schema.js    # 8. new schema tables (Phase 8)
node --env-file=.env.local alter_shipment_table.js  # 9. address_id + timestamps on shipment
node --env-file=.env.local drop_columns.js          # 10. drops price/stock/image from product_table
node --env-file=.env.local seed_superadmin.js       # 11. seeds superadmin role and account
```

---

## 📝 Key Technical Notes

- **No ORM** — raw SQL via `mysql2` parameterized queries (`?` placeholders)
- **`proxy.js`** replaces `middleware.js` in Next.js 16
- **`params` / `searchParams`** must be `await`-ed in Next.js 16
- **`useSearchParams`** requires `<Suspense>` boundary in Client Components
- Passwords hashed with `bcryptjs` (cost 12)
- JWT in HttpOnly cookie `ecom_session` (7-day expiry)
- Checkout uses a **DB transaction** — atomically checks stock → inserts order → inserts shipment → deducts stock → clears cart
- Seller must **create a store first** before listing products
- Sellers can also shop as customers (cart, wishlist, purchases)
- Chat uses **3-second polling** via `setInterval` — not WebSockets
- Voucher discount is client-side in cart display; server-side enforcement recommended before production billing
- PWA requires HTTPS in production for installability
- TiDB pool uses `enableKeepAlive: true` + global dev cache to prevent `ECONNRESET` drops during hot-reloads
- Images use native `<img>` tags (not `next/image`) to prevent SSR crashes from invalid seller-provided URLs
- Upload API falls back to local `/public/uploads` if Cloudinary keys are missing

---

## 🌟 All Features — Completed ✅

| Feature | Phase |
|---|---|
| User registration & login (JWT, HttpOnly cookie) | Phase 2 |
| Role-based route protection (proxy.js) | Phase 2 |
| Product catalog with search & category filter | Phase 3 |
| Cloudinary image upload (+ local fallback) | Phase 6 |
| Shopping cart (add / update / remove) | Phase 4 |
| Saved delivery addresses | Phase 8 |
| Voucher / discount codes | Phase 7 |
| Checkout with mock payment (GCash / PayPal) | Phase 6 |
| Order confirmation page | Phase 8 |
| Shipment record linked to delivery address | Phase 8 |
| Product reviews & star ratings | Phase 6 |
| Wishlist with heart toggle | Phase 7 |
| Real-time chat — buyer ↔ seller (3s polling) | Phase 7 |
| Seller dashboard (products & orders) | Phase 5 |
| Admin dashboard (users, products, orders) | Phase 5 |
| Admin role promotion | Phase 5 |
| Superadmin Role & Access | Phase 8 |
| Admin voucher management | Phase 7 |
| Seller upgrade (customer → seller via settings) | Phase 5 |
| Purchase History Page | Phase 8 |
| Toast Notifications (sonner) | Phase 8 |
| Progressive Web App (PWA manifest) | Phase 7 |
| Lazapee brand + shadcn/ui design system | Phase 7 |
