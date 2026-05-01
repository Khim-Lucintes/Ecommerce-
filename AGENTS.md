# Fullstack Development Agent Skill
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Overview

**Stack**: Next.js 16.2.4 · React 19.2.4 · TiDB Cloud (MySQL-compatible) · Tailwind CSS v4 · JavaScript (no TypeScript)

**Database**: TiDB Cloud via `mysql2/promise`. Connection pool is in `lib/db.js`. All DB access goes through this pool — never create ad-hoc connections.

**Runtime**: Node.js 20.9+ required.

---

## Mandatory Pre-Code Checklist

Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`:

| Task | Read First |
|---|---|
| Routing / pages | `01-app/03-file-conventions/page.md` |
| Layouts | `01-app/03-file-conventions/layout.md` |
| Route Handlers (API) | `01-app/03-file-conventions/route.md` |
| Server Actions | `01-app/01-getting-started/mutating-data.md` |
| Caching | `01-app/02-guides/use-cache.md` |
| Auth / session | `01-app/02-guides/authentication.md` |
| Middleware → Proxy | `01-app/03-file-conventions/proxy.md` |
| Images | `01-app/05-api-reference/02-components/image.md` |

---

## Next.js 16 Breaking Changes (Critical)

### 1. Async Request APIs — MANDATORY

`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now **fully async**. Synchronous access is removed entirely.

```js
// ✅ CORRECT — Next.js 16
export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  // ...
}

// ❌ WRONG — will throw at runtime
export default function Page({ params }) {
  const { slug } = params; // synchronous — REMOVED
}
```

### 2. `middleware` → `proxy`

The `middleware.js` filename and `export function middleware()` are deprecated. Use `proxy.js` with `export function proxy()`.

```js
// ✅ CORRECT — proxy.js
export function proxy(request) { /* ... */ }

// ❌ WRONG — middleware.js is deprecated
export function middleware(request) { /* ... */ }
```

Config flags also renamed: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.

### 3. `revalidateTag` Now Requires Second Argument

```js
// ✅ CORRECT
revalidateTag('products', 'max')

// ❌ WRONG — single-argument is deprecated
revalidateTag('products')
```

For immediate read-your-writes: use `updateTag` from `next/cache` inside Server Actions.

### 4. Caching APIs — No More `unstable_` Prefix

```js
// ✅ CORRECT
import { cacheLife, cacheTag } from 'next/cache'

// ❌ WRONG
import { unstable_cacheLife as cacheLife } from 'next/cache'
```

### 5. PPR → `cacheComponents`

```js
// ✅ CORRECT — next.config.mjs
const nextConfig = { cacheComponents: true }

// ❌ WRONG
const nextConfig = { experimental: { ppr: true } }
```

### 6. Parallel Routes Require `default.js`

Every parallel route slot (`@modal`, etc.) must have an explicit `default.js`. Builds fail without it.

```js
// app/@modal/default.js
export default function Default() { return null }
```

### 7. `next lint` Command Removed

Run ESLint directly: `npx eslint .`  
`next build` no longer runs linting.

### 8. `serverRuntimeConfig` / `publicRuntimeConfig` Removed

Use environment variables. Prefix with `NEXT_PUBLIC_` for client-accessible values.

### 9. Turbopack is Default

`next dev` and `next build` use Turbopack by default. Custom `webpack` configs will break the build. Migrate to Turbopack options or use `next build --webpack` to opt out.

### 10. `next/legacy/image` Deprecated

Always use `import Image from 'next/image'`.

---

## Project Architecture

### Directory Structure

```
ecommerce-system/
├── app/                        # App Router root
│   ├── layout.js               # Root layout — HTML shell, global CSS
│   ├── page.js                 # Home page (/)
│   ├── globals.css             # Global styles (Tailwind v4 directives here)
│   ├── (auth)/                 # Route group — no URL segment
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── (shop)/                 # Route group
│   │   ├── products/
│   │   │   ├── page.js         # /products
│   │   │   └── [id]/page.js   # /products/[id]
│   │   └── cart/page.js
│   ├── (dashboard)/            # Protected admin area
│   │   └── admin/
│   │       └── page.js
│   └── api/                    # Route Handlers
│       └── [...]/route.js
├── lib/
│   ├── db.js                   # TiDB connection pool (SINGLE SOURCE OF TRUTH)
│   ├── auth.js                 # Session / JWT helpers
│   └── utils.js                # Shared utilities
├── components/                 # Shared UI components
│   ├── ui/                     # Primitives (Button, Input, Card, etc.)
│   └── [feature]/              # Feature-scoped components
├── actions/                    # Server Actions (grouped by domain)
│   ├── auth.js
│   ├── products.js
│   └── orders.js
├── proxy.js                    # Request proxy / auth guard (replaces middleware)
├── setup_db.js                 # DB schema bootstrap script
└── .env.local                  # Secrets — NEVER commit
```

### Layer Responsibilities

| Layer | Location | Rules |
|---|---|---|
| **UI** | `app/`, `components/` | Client Components only when state/events are needed. Default to Server Components. |
| **Server Actions** | `actions/*.js` | `'use server'` at top. All mutations go here. Never call DB directly from Client Components. |
| **Route Handlers** | `app/api/**/route.js` | For external-facing REST endpoints (webhooks, mobile clients). Prefer Server Actions for internal mutations. |
| **Data Access** | `lib/db.js` | All queries via the shared pool. No raw connection strings in routes/actions. |
| **Auth Guard** | `proxy.js` | Session validation, redirects for unauthenticated users. |

---

## Data Access Patterns

### Database Queries

Always import the pool from `lib/db.js`:

```js
import pool from '@/lib/db'

// In a Server Component or Server Action
const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id])
```

### Server Actions (Mutations)

```js
// actions/products.js
'use server'

import pool from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function createProduct(formData) {
  const name = formData.get('name')
  const price = formData.get('price')

  await pool.query(
    'INSERT INTO products (name, price) VALUES (?, ?)',
    [name, price]
  )

  revalidateTag('products', 'max')
}
```

### Route Handlers

```js
// app/api/products/route.js
import pool from '@/lib/db'

export async function GET(request) {
  const [rows] = await pool.query('SELECT * FROM products')
  return Response.json(rows)
}
```

---

## Caching Strategy

| Data Type | Strategy |
|---|---|
| Product listings | `cacheTag('products')` in fetch, `revalidateTag('products', 'max')` on mutation |
| User-specific data | No cache (dynamic, authenticated) |
| Static content | `cacheLife('max')` |
| Real-time updates | `updateTag()` inside Server Actions for read-your-writes |

```js
// Fetching with cache tags
import { cacheTag, cacheLife } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheTag('products')
  cacheLife('hours')
  const [rows] = await pool.query('SELECT * FROM products')
  return rows
}
```

---

## Authentication Pattern

Session handling lives in `lib/auth.js`. Route protection goes in `proxy.js`.

```js
// proxy.js
import { NextResponse } from 'next/server'

export function proxy(request) {
  const token = request.cookies.get('session')?.value
  const isProtected = request.nextUrl.pathname.startsWith('/admin')

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
```

---

## Component Conventions

### Server vs Client Components

- **Default to Server Components** — no `'use client'` unless you need hooks, browser APIs, or event handlers.
- Push `'use client'` to leaf nodes — keep as small as possible.
- Never `import` server-only modules (e.g., `lib/db.js`) in Client Components.

```js
// ✅ Server Component (no directive needed)
export default async function ProductList() {
  const products = await getProducts()
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}

// ✅ Client Component — only when needed
'use client'
import { useState } from 'react'

export default function AddToCartButton({ productId }) {
  const [added, setAdded] = useState(false)
  return <button onClick={() => setAdded(true)}>{added ? 'Added!' : 'Add to Cart'}</button>
}
```

### File Naming

- Pages: `page.js`
- Layouts: `layout.js`
- Loading UI: `loading.js`
- Error boundaries: `error.js` (must be `'use client'`)
- Not found: `not-found.js`
- Proxy/guard: `proxy.js` (root level, not inside `app/`)

---

## Environment Variables

| Variable | Usage |
|---|---|
| `TIDB_HOST` | DB host — server only |
| `TIDB_PORT` | DB port (4000) — server only |
| `TIDB_USERNAME` | DB user — server only |
| `TIDB_PASSWORD` | DB password — server only |
| `TIDB_DATABASE` | DB name — server only |
| `NEXT_PUBLIC_*` | Client-accessible values only |

**Rules:**
- Never expose `TIDB_*` variables to the client.
- Use `NEXT_PUBLIC_` prefix only for values safe for public exposure.
- For runtime (not build-time) env reads, call `connection()` from `next/server` before accessing `process.env`.

---

## Tailwind CSS v4 Notes

This project uses **Tailwind CSS v4** with the `@tailwindcss/postcss` plugin.

- v4 uses CSS-first config — no `tailwind.config.js` by default.
- Import Tailwind in `app/globals.css` with `@import "tailwindcss"`.
- Theme customization is done with CSS custom properties inside `@theme {}`.
- Arbitrary values still work: `w-[200px]`, `bg-[#ff6b6b]`.

---

## Code Quality Standards

1. **ESLint**: Run `npx eslint .` — `next lint` is removed in v16.
2. **No `any` equivalents**: Validate all user inputs in Server Actions before DB writes.
3. **Error handling**: Wrap all DB queries in try/catch. Return structured errors from Server Actions.
4. **SQL injection prevention**: Always use parameterized queries (`?` placeholders with `mysql2`).
5. **Secrets**: Never log or expose env variables containing credentials.

### Server Action Error Pattern

```js
export async function createProduct(prevState, formData) {
  try {
    // validate
    const name = formData.get('name')?.toString().trim()
    if (!name) return { error: 'Name is required' }

    await pool.query('INSERT INTO products (name) VALUES (?)', [name])
    revalidateTag('products', 'max')
    return { success: true }
  } catch (err) {
    console.error('[createProduct]', err)
    return { error: 'Failed to create product' }
  }
}
```

---

## Common Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---|---|
| Access `params` synchronously | `await params` — it's a Promise in v16 |
| Use `middleware.js` | Use `proxy.js` with `export function proxy()` |
| `revalidateTag('tag')` (1 arg) | `revalidateTag('tag', 'max')` |
| `import { unstable_cacheTag }` | `import { cacheTag } from 'next/cache'` |
| Create DB connections in routes | Import pool from `lib/db.js` |
| Put secrets in `NEXT_PUBLIC_*` | Use server-only env vars |
| Fetch data in Client Components | Fetch in Server Components, pass as props |
| Use `getConfig()` from `next/config` | Use `process.env` directly |
| `import Image from 'next/legacy/image'` | `import Image from 'next/image'` |
| Use `experimental.ppr: true` | Use `cacheComponents: true` |

---

## Database Schema Reference

All tables live in `ecommerce_db`. See `ecommerce_schema.md` for full DDL. All schema changes must also be reflected in `setup_db.js`.

| Domain | Table |
|---|---|
| User & Access | `role_table`, `profile_table` |
| Seller / Store | `store_table` |
| Product Catalog | `category_table`, `product_table` |
| Cart | `cart_table` |
| Order | `order_table` |
| Payment | `payment_table` |
| Shipping | `shipment_table` |
| Review | `review_table` |

**Roles seeded in `role_table`**: `admin` (1), `seller` (2), `customer` (3)

---

## Running the Project

```bash
# Development (Turbopack by default)
npm run dev

# Bootstrap DB schema (first time)
node --env-file=.env.local setup_db.js

# Seed roles into role_table (run once after setup)
node --env-file=.env.local seed_roles.js

# Lint
npx eslint .

# Production build
npm run build
npm run start
```
