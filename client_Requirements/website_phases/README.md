# NovaCart Full-Stack E-Commerce & Embedded AI Support Agent Roadmap

> **Project:** NovaCart Live E-Commerce Platform + Embedded Context-Aware AI Support Agent  
> **Client:** NovaCart (E-commerce Consumer Electronics & Tech Retailer)  
> **Architecture:** Next.js 14 (React / TypeScript / Tailwind CSS) + FastAPI Backend + PostgreSQL / SQLite Database + ChromaDB (RAG) + LangChain Tool-Calling Agent + Embedded Floating AI Widget  
> **Location:** `D:\SupportIQ\client_Requirements\website_phases`

---

## 1. Executive Summary & Vision

This roadmap evolves SupportIQ from a standalone chatbot querying static CSV files into an **authentic, full-stack, live e-commerce ecosystem with an embedded floating AI shopping & support assistant ("Nova AI")**.

Customers can browse a rich technology catalog, add items to cart, checkout to generate real orders in a relational database, and immediately interact with the floating AI widget. The AI assistant connects directly to the **live relational database** and **vector knowledge base**, offering real-time order tracking, live inventory checks, website-page context awareness, and self-service transactional actions (order cancellation, return requests, shipping address updates).

```
                                      NOVACART E-COMMERCE PLATFORM
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
       Next.js 14 Storefront                                          Embedded Floating AI Widget
       • Hero & Tech Catalog                                          • Expandable global chat drawer
       • Product Detail Pages                                         • Live page & product context
       • Shopping Cart & Checkout                                     • Customer JWT authentication
       • My Orders & History                                          • Instant action execution
                   │                                                               │
                   └───────────────────────────────┬───────────────────────────────┘
                                                   │ (REST / SSE Streaming)
                                                   ▼
                                         FastAPI Business API
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        Storefront Endpoints                                            LangChain Agent Engine
        • POST /api/v1/store/orders                                     • Tool-calling agent (Gemini / Groq)
        • GET  /api/v1/store/products                                   • Context-aware reasoning
        • POST /api/v1/store/auth/login                                 • Strict cross-customer permission guard
                   │                                                               │
                   └───────────────────────────────┬───────────────────────────────┘
                                                   │
        ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
        ▼                                          ▼                                          ▼
Relational Database                         Vector Database                            External Tools
(PostgreSQL / SQLite)                         (ChromaDB)                            (Serper Google Search)
• Users & Profiles                         • Return Policies                         • Live 2026 Tech News
• Products & Inventory                     • Shipping Policies                       • Competitor Research
• Orders & OrderItems                      • Warranty & Terms                        • Industry Trends
• Return Requests & Tickets                • Product Manuals                         • GDELT Global Events
```

---

## 2. Core Architectural Pillars

### Pillar 1: Single Source of Truth (Live Relational Database)
* Replaces static `products.csv` and `orders.csv` with a normalized SQL database (`PostgreSQL` / `SQLite`).
* When a customer places an order on the website, inventory stock automatically decrements and an order row is created.
* When the customer opens the AI chat widget and asks *"Where is my order?"* or *"Do you have the RTX 5070 laptop in stock?"*, the AI queries the **exact same live SQL database powering the storefront**.

### Pillar 2: Architectural Separation (Structured vs. Unstructured Data)
* **Structured Real-Time Data (SQL Database):** Products, inventory stock, prices, customer orders, shipping tracking, delivery status, and returns.
* **Unstructured Official Policies (ChromaDB Vector RAG):** 30-day return policies, warranty exclusions, international shipping rules, and customer FAQs.
* **Live Web Intelligence (Serper / Tavily / GDELT):** 2026 tech trends, external brand comparisons, and breaking news.

### Pillar 3: Page & Context-Aware AI Widget
* The floating AI widget captures browser navigation context:
  ```json
  {
    "current_page": "/products/novabook-pro-14",
    "active_product_id": "P-1001",
    "cart_items_count": 2,
    "authenticated_user_id": "CUS-102"
  }
  ```
* When on a laptop product page, asking *"Does this have a warranty?"* automatically resolves *"this"* to the NovaBook Pro 14 and grounds the response using its specific warranty terms.

### Pillar 4: Autonomous Agentic Actions (Self-Service Support)
* The AI is empowered to execute real database write transactions under strict authorization rules:
  1. `create_return_request(order_id, reason)`
  2. `cancel_order(order_id, reason)`
  3. `update_shipping_address(order_id, new_address)`
  4. `create_support_ticket(subject, description, priority)`

---

## 3. Website Phase Implementation Roadmap

| Phase | Specification Document | Focus Area | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 01** | [`Phase_01_NovaCart_Ecommerce_Frontend.md`](./Phase_01_NovaCart_Ecommerce_Frontend.md) | Next.js 14 Storefront | Home, Catalog, Product Detail, Cart, Checkout, Auth, Orders UI |
| **Phase 02** | [`Phase_02_Relational_Database_and_Store_Backend.md`](./Phase_02_Relational_Database_and_Store_Backend.md) | Database & Store API | PostgreSQL/SQLite ORM models, CSV seed migration, Store REST APIs |
| **Phase 03** | [`Phase_03_Embedded_Floating_AI_Widget.md`](./Phase_03_Embedded_Floating_AI_Widget.md) | Embedded AI Widget | Global floating robot button, chat drawer, page context injection |
| **Phase 04** | [`Phase_04_Live_Database_Agentic_Tools.md`](./Phase_04_Live_Database_Agentic_Tools.md) | SQL Agentic Tools | DB-backed `search_products`, `get_order_status`, `check_inventory` |
| **Phase 05** | [`Phase_05_Context_Aware_RAG_and_Policy_Grounding.md`](./Phase_05_Context_Aware_RAG_and_Policy_Grounding.md) | Context-Aware RAG | Page-aware policy retrieval, warranty grounding, vector citations |
| **Phase 06** | [`Phase_06_Autonomous_Agentic_Actions.md`](./Phase_06_Autonomous_Agentic_Actions.md) | Action Execution | Self-service order cancellations, returns, address updates, tickets |
| **Phase 07** | [`Phase_07_Authentication_and_Data_Security.md`](./Phase_07_Authentication_and_Data_Security.md) | Auth & Security | JWT token verification, cross-customer permission guard, prompt safety |
| **Phase 08** | [`Phase_08_Production_Analytics_and_Deployment.md`](./Phase_08_Production_Analytics_and_Deployment.md) | Analytics & Deploy | Sales charts, live PowerPoint builder from SQL DB, Docker setup |

---

## 4. Technology Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, React Markdown.
* **Backend:** FastAPI (Python 3.11+), Pydantic v2, Uvicorn, SQLAlchemy ORM, Alembic.
* **Database:** PostgreSQL (Production) / SQLite (Local zero-config fallback).
* **AI & Agent:** LangChain, Google Gemini 3.6 Flash / Groq GPT-OSS 20B, ChromaDB (Vector DB), SentenceTransformers.
* **Search Integrations:** Serper.dev (Google News/Search), Tavily AI, GDELT Project.
* **Document & Presentation Generation:** `python-pptx` (Native Microsoft Office XML Charts).
