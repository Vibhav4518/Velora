# 🛍️ VELORA - Production-Ready Full-Stack E-Commerce Platform

VELORA is a modern luxury full-stack e-commerce platform engineered with a **Django REST Framework** backend, **PostgreSQL** database, and a high-performance **React.js (Vite)** Single Page Application (SPA) frontend styled with **Tailwind CSS**.

---

## 🌐 Live Production Deployment Links

| Environment | Service | Live Production URL |
|---|---|---|
| **Frontend** | React SPA (Vercel) | [https://velora-beryl-five.vercel.app](https://velora-beryl-five.vercel.app) |
| **Storefront** | Product Catalog | [https://velora-beryl-five.vercel.app/shop](https://velora-beryl-five.vercel.app/shop) |
| **Backend API** | Django REST API (Render) | [https://velora-v0f2.onrender.com/api/](https://velora-v0f2.onrender.com/api/) |
| **Admin Panel** | Django Administration | [https://velora-v0f2.onrender.com/admin/](https://velora-v0f2.onrender.com/admin/) |
| **API Specs** | Swagger Interactive Docs | [https://velora-v0f2.onrender.com/api/schema/swagger-ui/](https://velora-v0f2.onrender.com/api/schema/swagger-ui/) |

---

## 🔑 Base Login Credentials

| Role | Email | Password | Access & Dashboard Capabilities |
|---|---|---|---|
| 👑 **Super Admin** | `admin@velora.com` | `Admin123!` | Full Admin Panel, User Roles, Security & Audit Logs (`/admin`) |
| 🏬 **Store Staff** | `staff@velora.com` | `Staff123!` | Product Catalog, Stock Levels & Order Fulfillment (`/admin`) |
| 🛍️ **Customer** | `customer@velora.com` | `Customer123!` | Customer Storefront, Cart, Wishlist, Checkout & Orders (`/shop`) |

---

## 🌟 Core Features & Highlights

- **Dynamic Single Page Application (SPA)**: Zero page reloads for all operations (cart updates, wishlist toggles, checkout, profile edits, admin CRUD).
- **Authentication & RBAC System**: JWT access and refresh token rotation, custom user model, and granular Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `STAFF`, `CUSTOMER`).
- **Product Catalog & Multi-Image Gallery**: API-driven catalog management, multi-angle secondary image galleries on product detail pages, real-time search, multi-criteria filtering (category, brand, price, rating, stock status), sorting, and randomized storefront discovery (`sort=random`).
- **Zero Product Hardcoding**: Product catalog items, images, categories, and brands are managed **100% programmatically via REST APIs / Postman**, maintaining clean, production-level seed commands that strictly set up initial roles and base accounts.
- **Cart & Wishlist Engine**: Session-based guest cart merging into user cart upon login, inventory stock limit enforcement, subtotal, shipping, and tax calculations.
- **Checkout & Payment Architecture**: Abstraction layer with mock payment gateway, coupon validation (`PERCENTAGE`, `FIXED`), and address management.
- **Order & Invoice System**: Order status timeline tracking (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REFUNDED`), inventory auto-reduction & restoration, and printable/downloadable invoices.
- **Product Reviews & Ratings**: Dynamic rating recalculation, verified purchase indicators, and admin moderation.
- **Admin Dashboard**: Real-time business analytics, low-stock warnings, user & role management, coupon manager, review moderator, and security audit log trail.
- **Global Toast Notification System**: Real-time feedback for every action (success, error, warning, info) positioned at top-right.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+, Django 5+, Django REST Framework, SimpleJWT, dj-database-url, Pillow, django-filter, drf-spectacular, gunicorn, pytest-django.
- **Database**: PostgreSQL on Render (`velora-postgres`).
- **Frontend**: React 18, Vite 6, Tailwind CSS v4, React Router v7, Axios, Lucide Icons, Context API.

---

## 📂 Project Structure

```
velora/
├── apps/
│   ├── accounts/       # Auth API, custom exception handlers, pagination
│   ├── users/          # Custom User model, RBAC Roles & Permissions
│   ├── catalog/        # Products, ProductImages, search & seed command
│   ├── categories/     # Categories & Subcategories
│   ├── brands/         # Brand partners
│   ├── cart/           # Shopping cart service & items
│   ├── wishlist/       # Customer wishlist & move-to-cart
│   ├── orders/         # Checkout & Order processing engine
│   ├── payments/       # Payment gateway abstraction
│   ├── shipping/       # Address book manager
│   ├── coupons/        # Discount coupon validator & engine
│   ├── reviews/        # Ratings & reviews with moderation
│   ├── inventory/      # Atomic stock tracking & logs
│   ├── invoices/       # Store invoices & print templates
│   ├── notifications/  # User notification system
│   ├── dashboard/      # Admin analytics REST endpoints
│   ├── audit/          # Security & administrative audit logs
│   └── support/        # Contact & support tickets
│
├── config/             # Django settings, WSGI, and URL routing
├── frontend/           # React + Vite + Tailwind CSS Single Page Application
│   ├── src/
│   │   ├── api/        # Axios client modules
│   │   ├── components/ # Reusable UI components & modals
│   │   ├── context/    # Auth, Cart, Wishlist, Toast Contexts
│   │   ├── pages/      # Shop, ProductDetail, Cart, Checkout, Admin pages
│   │   └── routes/     # Router configuration
└── README.md
```

---

## ⚡ API Product Insertion Guide (Postman & HTTP)

Products and multi-image galleries are inserted and updated programmatically via HTTP requests:

### 1. Create Product (POST `/api/products/`)
- **Headers**: `X-Admin-Secret: velora-secret-admin-key` or `Authorization: Bearer <ADMIN_TOKEN>`
- **Payload Example**:
```json
{
  "sku": "VEL-PROD-001",
  "name": "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
  "category": 1,
  "brand": 3,
  "price": "399.99",
  "stock_quantity": 45,
  "description": "Industry-leading noise cancellation powered by two processors and 8 microphones.",
  "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "image_urls": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
  ]
}
```

### 2. Update Product Images (PATCH `/api/products/<slug>/`)
- **Headers**: `X-Admin-Secret: velora-secret-admin-key`
- **Payload**:
```json
{
  "image_urls": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
  ]
}
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
# Apply migrations
python manage.py migrate

# Seed base system roles & user accounts ONLY (No product seeding in code)
python manage.py seed_data

# Run Django dev server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to run the frontend locally.
