# Phase 01: NovaCart Modern E-Commerce Frontend (Next.js 14 / React / Tailwind)

> **Phase Status:** Planned  
> **Prerequisites:** None (Frontend scaffold in `frontend/`)  
> **Target Outcome:** A fully functional, responsive, high-performance Next.js 14 (App Router) e-commerce storefront for NovaCart with catalog browsing, dynamic product detail pages, interactive cart, multi-step checkout flow, user authentication, and order tracking.

---

## 1. Objective

Build a modern consumer tech e-commerce website for NovaCart. The storefront provides an authentic shopping journey where customers can discover laptops, smartphones, and accessories, add items to a live shopping cart, checkout to generate real orders, and track deliveries.

---

## 2. Frontend Page Structure & Routes

```text
frontend/
├── app/
│   ├── layout.tsx                <-- Global layout with Navigation Bar, Footer & Embedded AI Widget
│   ├── page.tsx                  <-- Storefront Homepage (Hero, Categories, Trending Tech)
│   ├── products/
│   │   ├── page.tsx              <-- Product Catalog with search, category filters & price sort
│   │   └── [id]/
│   │       └── page.tsx          <-- Product Detail Page (Specs, stock counter, reviews, add to cart)
│   ├── cart/
│   │   └── page.tsx              <-- Shopping Cart Drawer & Full Cart View with quantity modifiers
│   ├── checkout/
│   │   └── page.tsx              <-- Checkout Page (Shipping address, payment selection, place order)
│   ├── orders/
│   │   ├── page.tsx              <-- Customer Order History ("My Orders")
│   │   └── [id]/
│   │       └── page.tsx          <-- Real-time Order Tracking Timeline & Delivery Status
│   ├── login/
│   │   └── page.tsx              <-- Customer Sign In & Demo Account Switcher
│   └── register/
│       └── page.tsx              <-- Customer Account Registration
├── components/
│   ├── store/
│   │   ├── Navbar.tsx            <-- Global navigation bar with category links, search & cart badge
│   │   ├── Footer.tsx            <-- Footer with policy links and company information
│   │   ├── ProductCard.tsx       <-- Reusable product card with image, rating, price & stock badge
│   │   ├── CategoryGrid.tsx      <-- Visual category cards (Laptops, Phones, Audio, Displays)
│   │   ├── CartDrawer.tsx        <-- Quick-access slide-over cart drawer
│   │   └── OrderTimeline.tsx     <-- Visual delivery stepper (Placed -> Processing -> Shipped -> Delivered)
│   └── ai/
│       └── FloatingAiWidget.tsx  <-- Global floating Nova AI robot button & chat drawer
└── context/
    ├── CartContext.tsx           <-- Global shopping cart state (items, add, remove, update, total)
    └── AuthContext.tsx           <-- Customer authentication state & active JWT token
```

---

## 3. Detailed Page Specifications

### A. Storefront Homepage (`/`)
* **Hero Banner:** Eye-catching tech promo (e.g. *"NovaBook Pro 14 — Next-Gen AI Performance"*).
* **Category Showcase:** Direct links to `Laptops`, `Smartphones`, `Audio & Wearables`, `Accessories`.
* **Featured Products Grid:** Top-selling tech hardware with live price badges and stock indicators.
* **Trust Badges:** 30-Day Money-Back Guarantee, Official Warranty, Free Express Delivery over 10,000 PKR.

### B. Product Catalog (`/products`)
* **Search & Filter Bar:** Full-text search with dynamic category pills (`All`, `Laptops`, `Smartphones`, `Accessories`).
* **Price Range & In-Stock Filter:** Slider filtering products by maximum price and in-stock toggles.
* **Sorting Dropdown:** Sort by Price (Low to High / High to Low), Rating, or Newest.

### C. Product Detail Page (`/products/[id]`)
* **Hardware Specs Table:** Detailed specifications (Processor, RAM, Storage, Battery, Display, Warranty).
* **Live Inventory Badge:** Dynamic stock pill (`In Stock: 15 units` vs `Low Stock: 2 units left` vs `Out of Stock`).
* **Cart Actions:** Quantity stepper, **"Add to Cart"** button, and **"Buy Now"** instant checkout.
* **Context Bridge:** When viewing this page, sends `product_id` and specs to the embedded AI widget.

### D. Cart & Checkout (`/cart` & `/checkout`)
* **Cart State Management (`CartContext`):** Persisted in `localStorage` with subtotal, tax calculation, and discounts.
* **Checkout Flow:** Customer enters delivery address, selects payment method (Cash on Delivery / Credit Card / EasyPaisa), and places order via `POST /api/v1/store/orders`.
* **Order Confirmation:** Redirects to `/orders/[id]` with real order ID (e.g. `NC-10026`).

### E. My Orders & Tracking (`/orders` & `/orders/[id]`)
* **Order History List:** Displays all past and active orders for the authenticated customer.
* **Tracking Timeline:** Interactive progress stepper showing current fulfillment stage (`Processing`, `Shipped`, `Delivered`).
* **Action Buttons:** Direct links to view invoice, request return, or open Nova AI for order help.

---

## 4. Verification & Testing Plan

1. **Storefront Browsing:** Verify navigation between Home, Category filters, and Product Detail pages.
2. **Cart State Flow:** Add items to cart from multiple product pages; verify quantities update accurately.
3. **Checkout Placement:** Complete checkout flow; verify generated order appears in `/orders`.
4. **Responsive UI:** Verify mobile, tablet, and desktop viewport responsiveness.

---

## 5. Phase Checklist

- [ ] Build global navigation layout with category links and cart counter badge.
- [ ] Implement product catalog grid with category filters and search bar.
- [ ] Build dynamic product detail page (`/products/[id]`) with hardware specifications table.
- [ ] Implement global `CartContext` with add/remove/quantity functions.
- [ ] Build `/cart` page and `/checkout` form submitting orders to backend.
- [ ] Build `/orders` and `/orders/[id]` tracking timeline page.
- [ ] Build `/login` with demo user accounts (`CUS-001`, `CUS-002`, `CUS-003`).
