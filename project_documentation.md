# SmartShop AI — Full Project Documentation

> **Project Name:** SmartShop AI
> **Internal DB Name:** `trendcart_db`
> **Brand Name:** Trendcart Innovators
> **Version:** 1.0.0
> **Stack:** Node.js + Express + MySQL + Vanilla JS + Chart.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [File Structure](#3-file-structure)
4. [System Architecture](#4-system-architecture)
5. [Authentication System](#5-authentication-system)
6. [AI Recommendation Engine](#6-ai-recommendation-engine)
7. [Sales Prediction Engine](#7-sales-prediction-engine)
8. [Checkout & Order System](#8-checkout--order-system)
9. [Admin Panel](#9-admin-panel)
10. [Database Schema](#10-database-schema)
11. [REST API Reference](#11-rest-api-reference)
12. [Product Dataset](#12-product-dataset)
13. [User Personas (Seed Data)](#13-user-personas-seed-data)
14. [Sales Data & Forecasting](#14-sales-data--forecasting)
15. [Networking & Deployment](#15-networking--deployment)

---

## 1. Project Overview

**SmartShop AI** is a full-stack, AI-powered e-commerce web application that merges personalized shopping with business intelligence. It is built as a Single-Page Application (SPA) served by a Node.js backend connected to a MySQL database.

### Core Goals
- Deliver **AI-driven personalized product recommendations** to each registered user.
- Provide **sales trend forecasting** (via Linear Regression) for business intelligence.
- Support a **complete e-commerce workflow**: browse → cart → checkout (UPI or COD) → order tracking.
- Enable **multi-role access**: standard shoppers and an admin control center.
- Allow **cross-device access** on the same Wi-Fi network without any cloud infrastructure.

### Key Features at a Glance

| Feature | Description |
|---|---|
| Hybrid AI Recommendations | Collaborative Filtering (60%) + Content-Based Filtering (40%) |
| Sales Forecasting | Linear Regression on 12-month historical data, 6-month ahead |
| Multi-Role Auth | Admin (hardcoded) + Standard Users (MySQL-backed) |
| Checkout Flow | 3-step: Delivery Address → Payment (UPI/COD) → Confirm |
| Admin Panel | User mgmt, order tracking, inline product editing, dataset upload |
| Session Persistence | localStorage-based session restored on page reload |
| Network Sharing | LAN URL auto-detected and shareable for cross-device demo |
| Analytics Dashboard | KPI cards + 3 Chart.js charts (Revenue, Category, Donut) |

---

## 2. Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | SPA structure (`index.html`) |
| **Vanilla CSS** | All styling — `main.css` (layout/tokens) + `components.css` (UI components) |
| **Vanilla JavaScript** | All client-side logic, state, routing, DOM, fetch API |
| **Chart.js v4.4.0** (CDN) | Analytics charts — Revenue, Category stacked bar, Donut |
| **Google Fonts** | `Outfit` (headings/UI) + `Inter` (body) |
| **QR Server API** | Dynamic UPI QR code generation via `api.qrserver.com` |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js v4** | HTTP server + REST API routing |
| **mysql2 v3** | MySQL database driver (Promise-based) |
| **cors** | Cross-origin requests for multi-device access |
| **os (built-in)** | Local LAN IP detection for network sharing |

### Database
| Technology | Purpose |
|---|---|
| **MySQL** | Persistent storage for users, orders, password requests |
| **Database Name** | `trendcart_db` (auto-created on first run) |

---

## 3. File Structure

```
c:\Satyam101\Mini Project 2\
│
├── server.js                  ← Node.js/Express backend (all API routes + DB init)
├── index.html                 ← Main SPA HTML (all views embedded, scripts loaded here)
├── package.json               ← npm metadata, dependencies, start scripts
├── package-lock.json          ← Locked dependency tree
├── README.md                  ← Project overview documentation
│
├── css/
│   ├── main.css               ← Design tokens, layout, sidebar, topbar, hero, global styles
│   └── components.css         ← Cards, buttons, modals, forms, tables, checkout UI, admin UI
│
└── js/
    ├── auth.js                ← Auth screen render, login/register/admin forms, session logic
    ├── data.js                ← PRODUCTS array, USERS seed, SALES_DATA, STATE object
    ├── recommendation.js      ← Cosine similarity, collaborative + content-based filtering
    ├── prediction.js          ← Linear regression, forecasting, KPI calculation
    ├── charts.js              ← Chart.js initialization (revenue, category, donut charts)
    ├── ui.js                  ← View renderers: Home, Catalog, Profile, Product Modal, Toast
    ├── admin.js               ← Admin panel: Users table, Orders table, Products table, Dataset upload
    ├── checkout.js            ← Cart, 3-step checkout modal, UPI QR, order placement
    └── app.js                 ← SPA router (navigate()), state management, event listeners, initApp()
```

> **Script Load Order** (critical — defined in `index.html`):
> `auth.js` → `data.js` → `recommendation.js` → `prediction.js` → `charts.js` → `ui.js` → `admin.js` → `checkout.js` → `app.js`

---

## 4. System Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (SPA)                  │
│                                             │
│  auth.js ──► launchApp() ──► initApp()      │
│                                  │          │
│           ┌──────────────────────┤          │
│           ▼                      ▼          │
│      navigate(view)         initEventListeners()
│           │                                 │
│   ┌───────┼────────────────┐               │
│   ▼       ▼       ▼        ▼               │
│  Home  Catalog  Analytics Profile  Admin   │
│   │       │        │                 │      │
│   ▼       ▼        ▼                ▼      │
│  recommendation  charts.js      admin.js   │
│  .js             prediction.js             │
│           │                      │         │
│           └──────────────────────┘         │
│                     │                       │
│              AuthManager (fetch)            │
└─────────────────────┼───────────────────────┘
                       │ REST API (HTTP)
┌──────────────────────▼───────────────────────┐
│              server.js (Express)             │
│                                              │
│  /api/auth/register   /api/auth/login        │
│  /api/users           /api/users/:id         │
│  /api/password-requests (POST/PUT)           │
│  /api/orders          /api/orders/user/:id   │
│  /api/orders/:id/status                      │
│                                              │
└──────────────────────┬───────────────────────┘
                       │ mysql2 (Promise pool)
┌──────────────────────▼───────────────────────┐
│          MySQL — trendcart_db                │
│  tables: users, orders, password_requests    │
└──────────────────────────────────────────────┘
```

### SPA Views
| View ID | Nav Label | Who Sees It |
|---|---|---|
| `view-home` | 🏠 Home | Everyone |
| `view-catalog` | 🛍️ Catalog | Everyone |
| `view-analytics` | 📊 Analytics | Everyone |
| `view-profile` | 👤 Profile | Users only |
| `view-admin` | 🛡️ Admin Panel | Admin only |

---

## 5. Authentication System

**File:** `js/auth.js`

### Roles

| Role | Credentials | Storage |
|---|---|---|
| **Standard User** | Username + Password | MySQL (`users` table) |
| **Admin** | `Trendcart Innovators` / `Admin@101` | Hardcoded in `auth.js` |

### Session Management
- Sessions stored in `localStorage` under key `tc_session`.
- Session object: `{ type: 'user', userId: '...' }` or `{ type: 'admin' }`.
- On page reload, `checkExistingSession()` runs:
  - Admin → restores directly.
  - User → calls `GET /api/users/:id` to re-hydrate the user object before launching the app.

### Auth Screen Flows

```
Auth Screen
├── User Tab
│   ├── Sign In form        → handleUserLogin()  → POST /api/auth/login
│   ├── Create Account form → handleRegister()   → POST /api/auth/register
│   └── Request Password Change → handlePwdChangeRequest() → POST /api/password-requests
└── Admin Tab
    └── Admin Sign In form  → handleAdminLogin() → local credential check (no API)
```

### UI Personalization After Login
- **Admin:** Hero says "CEO Sir", chip says "🛡️ Welcome! Trendcart Innovators". Cart hidden, Admin nav shown.
- **User (Male):** "Mr. [FirstName]" greeting. E.g., "Mr. Satyam".
- **User (Female):** "Mrs./Miss [FirstName]" greeting.

### `AuthManager` — API Client Object
All HTTP calls go through the `AuthManager` object, which wraps `fetch()` with try/catch:

| Method | API Call |
|---|---|
| `register(...)` | `POST /api/auth/register` |
| `login(u, p)` | `POST /api/auth/login` |
| `adminLogin(u, p)` | Local credential check |
| `getUsers()` | `GET /api/users` |
| `getUserById(id)` | `GET /api/users/:id` |
| `updateUser(id, fields)` | `PUT /api/users/:id` |
| `requestPasswordChange(u, p)` | `POST /api/password-requests` |
| `approvePasswordChange(id)` | `PUT /api/password-requests/:id/approve` |
| `rejectPasswordChange(id)` | `PUT /api/password-requests/:id/reject` |
| `placeOrder(data)` | `POST /api/orders` |
| `getOrders()` | `GET /api/orders` |
| `getUserOrders(id)` | `GET /api/orders/user/:id` |

---

## 6. AI Recommendation Engine

**File:** `js/recommendation.js`

### Algorithm: Hybrid Filtering
```
Final Score = (Collaborative Filtering × 0.60) + (Content-Based Filtering × 0.40)
Match % displayed = 70 + (hybridScore × 30)   →  range: 70%–100%
```

### Collaborative Filtering (60%)
Uses **Cosine Similarity** between users' rating vectors.

```
cosineSimilarity(vecA, vecB) = dot(A,B) / (|A| × |B|)
```
- For each product, finds all other users who rated it.
- Weights their ratings by similarity to the current user.
- Returns a weighted average as the collaborative score.

### Content-Based Filtering (40%)
Scores a product against the current user's profile:
- **+2 points** if the product's category matches the user's `preferences`.
- **+0.5 per tag** that overlaps with tags of previously viewed/purchased products.
- **+0.3 per rating point** if the user has already rated this product.
- Normalized to 0–1 range by dividing by 5.

### Key Functions

| Function | Description |
|---|---|
| `getHybridRecommendations(userId, limit=6)` | Returns top-N hybrid-scored products, excluding already purchased items |
| `getTrendingProducts(limit=6)` | Sorts by last month's unit sales count |
| `getRelatedProducts(productId, limit=4)` | Tag overlap + category match for "You May Also Like" |
| `getRecommendationReason(userId, product)` | Human-readable reason string for a recommendation |

### Where Each Is Used (Home View)
| Section | Function |
|---|---|
| ✨ Recommended For You | `getHybridRecommendations()` |
| 🔥 Trending Now | `getTrendingProducts()` |
| 💡 You May Also Like | `getRelatedProducts()` based on last viewed product |

---

## 7. Sales Prediction Engine

**File:** `js/prediction.js`

### Algorithm: Linear Regression
Fits a straight line through 12 months of historical revenue data to project 6 months into the future.

```
slope     = Σ[(x - x̄)(y - ȳ)] / Σ[(x - x̄)²]
intercept = ȳ - slope × x̄
forecast(t) = intercept + slope × t
```

### Key Functions

| Function | Description |
|---|---|
| `linearRegression(data[])` | Returns `{ slope, intercept }` for a data series |
| `predictNext(data[], steps=6)` | Generates `steps` future predictions (min 0) |
| `getOverallForecast(steps=6)` | Total revenue across all categories, forecasted |
| `getCategoryForecast(category, steps=6)` | Per-category historical + forecast + trend % |
| `getKPIs()` | Calculates 4 KPI cards for the Analytics dashboard |
| `getTopProducts(limit=5)` | Top products by total revenue (units × price) |
| `getTrendBadge(trendPct)` | Returns `{ icon, label, cls }` for ↑/↓/→ trend indicators |

### KPI Cards (Analytics View)
| KPI | Calculation |
|---|---|
| 💰 Total Revenue | Sum of all `SALES_DATA` monthly values |
| 📦 Total Orders | Sum of all product `monthlySales` arrays |
| 🛒 Avg Order Value | Total Revenue ÷ Total Orders |
| 🔮 6-Mo Forecast | Sum of next 6 predicted months via `getOverallForecast()` |

---

## 8. Checkout & Order System

**File:** `js/checkout.js`

### 3-Step Checkout Flow

```
Step 1: Delivery Address
  └─ Full Name, Phone (10 digits), Street, City, State, PIN (6 digits)
  └─ Validation: all required, regex checks for phone & PIN
       │
       ▼
Step 2: Payment Method
  ├─ UPI:  Dynamic QR code (api.qrserver.com), UPI deep-link, copy UPI ID, TXN ID input
  │         UPI ID: 8405828589@upi  |  Name: TrendCart Innovators
  └─ COD:  Info card with order total, delivery timeline note (3–5 days)
       │
       ▼
Step 3: Order Confirmation
  └─ Summary of delivery details, payment method, all items + total
  └─ "Place Order" button → placeOrder()
```

### `placeOrder()` Flow
1. Collects all form data + cart items into `orderData` object.
2. Calls `AuthManager.placeOrder(orderData)` → `POST /api/orders`.
3. On success:
   - Updates `AUTH_STATE.currentAuthUser.purchases` locally (affects future recommendations).
   - Clears `STATE.cart` and resets cart badge to 0.
   - Shows the **Order Success** modal with Order ID, payment method, total, and delivery estimate.

### Cart Management
- Cart stored in `STATE.cart` (array of product IDs).
- Cart badge (`#cart-count`) updated on every add/remove.
- Cart button (top bar) triggers `openCheckout()`.
- Empty cart or guest user shows an info toast instead of opening the modal.

---

## 9. Admin Panel

**File:** `js/admin.js`  |  **Access:** Admin login only

The Admin Panel has **4 tabs**:

### Tab 1: 👥 Users
Displays all registered users from the database:
- Columns: User ID, Name (with salutation), Gender, Email, Username, Purchased Items, Password (hidden/reveal), Password Change Request.
- **Password Change Requests**: If a user has a pending request, admin sees "✅ Approve" and "❌ Reject" buttons. Approval calls `PUT /api/password-requests/:userId/approve` and updates the user's password in MySQL.

### Tab 2: 🛍️ Products
Inline-editable product table (edits are in-memory, not persisted to DB):
- Editable fields: Name, Category (dropdown), Price, Original Price, Stock, Badge.
- `saveProductField()` mutates the in-memory `PRODUCTS` array and shows a toast.

### Tab 3: 📦 Orders
All orders from the database:
- Columns: Order ID, Customer Name, Items, Total (₹), Payment Method, Delivery Address, Status, Date.
- **Status Dropdown**: Admin can change status (Pending → Confirmed → Shipped → Delivered). Calls `PUT /api/orders/:id/status`.

### Tab 4: 📊 Dataset
- **View Current Dataset**: Shows `PRODUCTS` array as formatted JSON in a read-only textarea.
- **Upload New Dataset**: Upload a `.json` file or paste a JSON array to replace the in-memory `PRODUCTS`.
- **Reset**: Reverts to the original `PRODUCTS` array.

### Admin Stats Bar (top of panel)
Shows live counts: Total Users | Total Products | Total Orders | Pending Password Requests.

---

## 10. Database Schema

**Database:** `trendcart_db` (auto-created on server start)

### Table: `users`
| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(40) | Primary Key. Format: `u_<timestamp>_<random>` |
| `name` | VARCHAR(120) | Full name |
| `email` | VARCHAR(120) | Unique |
| `username` | VARCHAR(60) | Unique |
| `password` | VARCHAR(120) | Plaintext (no hashing — academic project) |
| `gender` | ENUM('Male','Female') | |
| `bio` | TEXT | Auto-generated on register |
| `preferences` | JSON | Array of category strings |
| `view_history` | JSON | Array of product IDs |
| `purchases` | JSON | Array of product IDs |
| `ratings` | JSON | Object: `{ productId: rating }` |
| `registered_at` | BIGINT | Unix timestamp (ms) |

### Table: `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary Key |
| `user_id` | VARCHAR(40) | FK → users.id |
| `user_name` | VARCHAR(120) | Denormalized for admin display |
| `items` | JSON | Array of `{ id, name, price, emoji }` |
| `total_amount` | DECIMAL(10,2) | |
| `payment_method` | ENUM('upi','cod') | |
| `upi_txn_id` | VARCHAR(100) | NULL for COD |
| `delivery_name` | VARCHAR(120) | |
| `delivery_phone` | VARCHAR(20) | |
| `delivery_address` | TEXT | |
| `delivery_city` | VARCHAR(80) | |
| `delivery_state` | VARCHAR(80) | |
| `delivery_pincode` | VARCHAR(10) | |
| `status` | ENUM('pending','confirmed','shipped','delivered') | Default: 'pending' |
| `created_at` | BIGINT | Unix timestamp (ms) |

### Table: `password_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary Key |
| `user_id` | VARCHAR(40) | FK → users.id (CASCADE DELETE) |
| `new_password` | VARCHAR(120) | Requested new password |
| `status` | ENUM('pending','approved','rejected') | Default: 'pending' |
| `requested_at` | BIGINT | Unix timestamp (ms) |

---

## 11. REST API Reference

**Base URL:** `http://localhost:3000/api` (or LAN IP on port 3000)

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ id, name, email, username, password, gender }` | Register new user |
| `POST` | `/auth/login` | `{ username, password }` | Login and get user object |

### Users

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/users` | — | Get all users + pending pwd requests (Admin) |
| `GET` | `/users/:id` | — | Get single user by ID |
| `PUT` | `/users/:id` | `{ view_history?, purchases?, ratings?, preferences? }` | Update user behavior data |

### Password Requests

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/password-requests` | `{ username, newPassword }` | Submit password change request |
| `PUT` | `/password-requests/:userId/approve` | — | Admin approves → updates user password |
| `PUT` | `/password-requests/:userId/reject` | — | Admin rejects request |

### Orders

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/orders` | Full order object | Place a new order |
| `GET` | `/orders` | — | Get all orders (Admin) |
| `GET` | `/orders/user/:userId` | — | Get orders for a specific user |
| `PUT` | `/orders/:id/status` | `{ status }` | Update order delivery status (Admin) |

### All responses follow:
```json
{ "ok": true, "data": ... }   // success
{ "ok": false, "msg": "..." } // error
```

---

## 12. Product Dataset

**File:** `js/data.js` — `PRODUCTS` array

**Total Products:** 30 across **6 categories**

| Category | Product Count | Price Range |
|---|---|---|
| Electronics | 6 | ₹59 – ₹449 |
| Fashion | 5 | ₹79 – ₹399 |
| Home & Living | 5 | ₹49 – ₹449 |
| Sports | 5 | ₹39 – ₹99 |
| Books | 4 | ₹19 – ₹49 |
| Gaming | 5 | ₹89 – ₹699 |

### Product Object Schema
```js
{
  id: Number,               // Unique integer ID
  name: String,             // Product display name
  category: String,         // One of 6 CATEGORIES
  price: Number,            // Current price (₹)
  originalPrice: Number,    // Strikethrough price (₹)
  rating: Number,           // 4.3 – 4.9
  reviews: Number,          // Review count
  tags: String[],           // For content-based filtering
  emoji: String,            // Product emoji icon
  color: String,            // Hex color for product card accent
  badge: String | null,     // e.g., "Best Seller", "Hot", "New", null
  monthlySales: Number[],   // 12-element array: Jan–Dec unit sales
  stock: Number             // Available stock
}
```

### Badges Present
`Best Seller` · `New` · `Hot` · `Trending` · `Top Rated`

---

## 13. User Personas (Seed Data)

**File:** `js/data.js` — `USERS` array (5 demo personas used for recommendation seeding)

| ID | Name | Avatar | Preferences | Purchases |
|---|---|---|---|---|
| 1 | Alex Chen | 👨‍💻 | Electronics, Gaming | Products #1, #3 |
| 2 | Priya Sharma | 👩‍🎨 | Fashion, Sports | Products #7, #17 |
| 3 | Marcus Johnson | 👨‍🏫 | Home & Living, Books | Products #14, #22, #24 |
| 4 | Emma Rodriguez | 👩‍🏋️ | Sports, Fashion | Products #17, #18, #19 |
| 5 | David Kim | 👨‍🎮 | Gaming, Books | Products #27, #30, #23 |

> These users serve as the neighbor pool for **Collaborative Filtering**. Real registered users also get added to the pool once they rate products.

---

## 14. Sales Data & Forecasting

**File:** `js/data.js` — `SALES_DATA` object

12 months of monthly revenue per category (Jan–Dec):

| Category | Jan | Jun | Dec | Trend |
|---|---|---|---|---|
| Electronics | ₹4.5L | ₹6.2L | ₹8.2L | ↑ Strong |
| Fashion | ₹3.2L | ₹3.6L | ₹6.4L | ↑ Seasonal |
| Home & Living | ₹2.8L | ₹3.55L | ₹4.7L | ↑ Steady |
| Sports | ₹2.1L | ₹3.0L | ₹3.95L | ↑ Steady |
| Books | ₹1.8L | ₹2.23L | ₹2.9L | ↑ Steady |
| Gaming | ₹3.8L | ₹5.12L | ₹6.62L | ↑ Strong |

The **Analytics View** renders:
1. **Revenue Trend & AI Forecast Chart** (Line chart) — 12 months historical + 6 months predicted
2. **Sales by Category Chart** (Stacked bar) — monthly category breakdown
3. **Revenue Distribution Donut** — share by category
4. **Top Performing Products Table** — ranked by total revenue

---

## 15. Networking & Deployment

### Starting the Server
```bash
cd "c:\Satyam101\Mini Project 2"
node server.js
# or
npm start
```

### Server Startup Output
```
╔══════════════════════════════════════════════════╗
║       SmartShop AI — Server Running             ║
╠══════════════════════════════════════════════════╣
║  Local:    http://localhost:3000                 ║
║  Network:  http://192.168.x.x:3000              ║
║  Share the Network URL with phones/laptops       ║
║  on the same Wi-Fi to access the app!            ║
╚══════════════════════════════════════════════════╝
```

### How Network Sharing Works
- Server binds to `0.0.0.0` (all interfaces).
- `os.networkInterfaces()` finds the first non-internal IPv4 address.
- The frontend `API` base URL is dynamically set to `window.location.hostname:3000`, so any device accessing the app via the LAN URL automatically hits the correct backend.
- The 🌐 Share button in the top bar displays the current URL and allows copying.

### MySQL Prerequisites
```
Host:     localhost
User:     root
Password: [configured in server.js DB_CONFIG]
Database: trendcart_db  (auto-created on first run)
Port:     3306 (default)
```
Tables are created automatically via `initDB()` on startup using `CREATE TABLE IF NOT EXISTS`.

### Dependencies
```json
{
  "cors":   "^2.8.5",
  "express":"^4.18.2",
  "mysql2": "^3.6.5"
}
```
Install with: `npm install`
