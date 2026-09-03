# SupportIQ & NovaCart — Comprehensive System Architecture

> **Status:** Live & Production-Ready (Phase 01 Complete)  
> **Last Updated:** September 3, 2026  
> **Location:** `D:\SupportIQ\SYSTEM_DESIGN.md`  
> **Interactive Browser View:** Open [`D:\SupportIQ\system_design.html`](file:///D:/SupportIQ/system_design.html) for full-screen zoomable rendering.

---

## 1. Master Full-Stack Architecture

```mermaid
flowchart TD
    subgraph CLIENT ["1. CLIENT STOREFRONT & EMBEDDED AI (Next.js 14 / React 18)"]
        UI_HOME["Storefront Homepage & Catalog<br/>(/, /products, /products/[id])"]
        UI_CART["Cart & Multi-Step Checkout<br/>(/cart, /checkout)"]
        UI_ORDERS["My Orders & Live Tracking Stepper<br/>(/orders, /orders/[id])"]
        UI_WIDGET["Embedded Floating 'Nova AI' Widget<br/>(Expandable Drawer, Dynamic Context)"]
        UI_AUTH["Customer Session Auth<br/>(CUS-001 Ali Raza, CUS-002, CUS-003)"]
    end

    subgraph API_GATEWAY ["2. BACKEND API GATEWAY (FastAPI / Uvicorn)"]
        API_STORE["Storefront REST Endpoints<br/>(GET /products, POST /orders)"]
        API_CHAT["Agent Chat & SSE Stream Endpoints<br/>(POST /api/v1/chat, /chat/stream)"]
        SEC_GUARD["SecurityGuard & Prompt Inspector<br/>(Anti-SQLi, Anti-Tamper, Auth Verification)"]
    end

    subgraph AGENT_CORE ["3. LANGCHAIN AGENTIC REASONING ENGINE"]
        LLM_ROUTER["Multi-Model LLM Router<br/>(Gemini 3.6 Flash / Groq GPT-OSS 20B)"]
        CTX_BRIDGE["Website Context Injector<br/>(current_path, viewing_product, cart_state)"]
        AGENT_EXEC["Tool Calling Agent Executor<br/>(temperature=0.35, max_iterations=4)"]
        PARSER["ResponseParser & Text Sanitizer<br/>(Markdown, Clickable Badges, PPT Cards)"]
        SESSION_MEM["SessionMemoryManager<br/>(Multi-Turn Conversation History)"]
    end

    subgraph SUBSYSTEM_DB ["4A. RELATIONAL DATABASE ENGINE (PostgreSQL / SQLite)"]
        TOOL_ORDER["get_order_status()<br/>(Ownership Check, Courier & Tracking)"]
        TOOL_PROD["search_products()<br/>(Full-Text ILIKE, Category, Max Price)"]
        TOOL_STOCK["check_inventory()<br/>(Real-Time Stock Availability)"]
        TOOL_ACTION["Autonomous Actions<br/>(cancel_order + restock, create_return_request)"]
        DB_TABLES[("Relational Tables<br/>• users, products, categories<br/>• orders, order_items, return_requests")]
    end

    subgraph SUBSYSTEM_RAG ["4B. VECTOR KNOWLEDGE BASE (ChromaDB)"]
        TOOL_RAG["search_knowledge_base()<br/>(MMR Similarity Search, k=4)"]
        VECTOR_DOCS[("Vector Embeddings (all-MiniLM-L6-v2)<br/>• return_policy.md (30-day window)<br/>• warranty_policy.md (coverage & claims)<br/>• shipping_policy.md, customer_faq.md")]
    end

    subgraph SUBSYSTEM_WEB ["4C. LIVE SEARCH & GLOBAL NEWS ENGINE"]
        TOOL_SEARCH["search_internet()<br/>(10-Chunk Capacity & Domain Diversity)"]
        ENGINE_SERPER["🌐 Google Serper.dev (News & Organic)"]
        ENGINE_TAVILY["🦅 Tavily AI (Advanced News Topic)"]
        ENGINE_GDELT["📡 GDELT Project (Free 24h News DB)"]
        ENGINE_DDG["🦆 DuckDuckGo Fallback"]
    end

    subgraph SUBSYSTEM_REPORTS ["4D. EXECUTIVE PRESENTATION & UTILITY"]
        TOOL_PPT["generate_presentation()<br/>(Native python-pptx Executive Slides)"]
        TOOL_CALC["calculate()<br/>(Safe Math Engine for Discounts & Taxes)"]
    end

    %% Client -> API Gateway
    UI_HOME -->|Browse Catalog| API_STORE
    UI_CART -->|Place Order| API_STORE
    UI_ORDERS -->|Fetch History| API_STORE
    UI_WIDGET -->|Transmit Query + Page Context| API_CHAT
    UI_AUTH -->|Customer ID & JWT| API_CHAT

    %% API Gateway -> Agent Core
    API_CHAT --> SEC_GUARD
    SEC_GUARD --> CTX_BRIDGE
    CTX_BRIDGE --> LLM_ROUTER
    LLM_ROUTER --> AGENT_EXEC
    AGENT_EXEC <--> SESSION_MEM

    %% Agent -> 4 Subsystems
    AGENT_EXEC --> TOOL_ORDER
    AGENT_EXEC --> TOOL_PROD
    AGENT_EXEC --> TOOL_STOCK
    AGENT_EXEC --> TOOL_ACTION
    TOOL_ORDER --> DB_TABLES
    TOOL_PROD --> DB_TABLES
    TOOL_STOCK --> DB_TABLES
    TOOL_ACTION --> DB_TABLES

    AGENT_EXEC --> TOOL_RAG
    TOOL_RAG --> VECTOR_DOCS

    AGENT_EXEC --> TOOL_SEARCH
    TOOL_SEARCH --> ENGINE_SERPER
    TOOL_SEARCH --> ENGINE_TAVILY
    TOOL_SEARCH --> ENGINE_GDELT
    TOOL_SEARCH --> ENGINE_DDG

    AGENT_EXEC --> TOOL_PPT
    AGENT_EXEC --> TOOL_CALC

    %% Response Delivery
    AGENT_EXEC --> PARSER
    PARSER --> API_CHAT
    API_CHAT --> UI_WIDGET
```

---

## 2. Context-Aware Dual-Engine Retrieval Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer (Ali Raza / CUS-001)
    participant Browser as 🌐 Next.js Storefront (/products/P-1001)
    participant Widget as 🤖 Floating AI Widget ("Nova AI")
    participant API as ⚡ FastAPI Gateway (/api/v1/chat)
    participant Agent as 🧠 LangChain Tool Agent
    participant DB as 🗄️ Relational Database (Products & Orders)
    participant Chroma as 📚 ChromaDB (Vector Knowledge Base)
    participant Search as 🌍 Multi-Engine Search (Serper / GDELT)

    Customer->>Browser: Views Apple MacBook Pro 16" M3 Max
    Browser->>Widget: Injects Page Context (viewing_product_id: "P-1001", cart_total: 485,000 PKR)
    Customer->>Widget: Asks: "Does this have an official warranty and is it in stock?"
    Widget->>API: POST /api/v1/chat {message, customer_id: "CUS-001", page_context}
    
    API->>API: SecurityGuard inspects prompt (Pass)
    API->>Agent: Agent resolves "this" -> Apple MacBook Pro 16" (P-1001)

    par 1. Live Inventory & Specs Check
        Agent->>DB: check_inventory("P-1001")
        DB-->>Agent: Returns stock: 8 units available, price: 485,000 PKR
    and 2. Official Warranty Policy Retrieval
        Agent->>Chroma: search_knowledge_base("MacBook Pro warranty coverage and claim duration")
        Chroma-->>Agent: Returns chunks from warranty_policy.md (2-Year Official AppleCare)
    end

    Agent->>Agent: Synthesize 2-paragraph grounded response with live stock & warranty terms
    Agent->>API: Structured SupportResponse {answer, sources: ["warranty_policy.md"], suggested_actions}
    API->>Widget: Deliver JSON response
    Widget-->>Customer: Renders response with clickable [warranty_policy.md] badge and prompt chips
```

---

## 3. Autonomous Order Action & Inventory Reconciliation

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Authenticated Customer (CUS-001)
    participant Widget as 🤖 Floating AI Widget
    participant API as ⚡ FastAPI Backend
    participant Agent as 🧠 Agentic Reasoning Engine
    participant ActionTool as ⚙️ Action Tools (cancel_order / create_return_request)
    participant DB as 🗄️ PostgreSQL / SQLite Database

    Customer->>Widget: Asks: "I want to cancel my unfulfilled order NC-10002"
    Widget->>API: POST /api/v1/chat with customer_id: "CUS-001"
    API->>Agent: Execute intent: Order Cancellation
    Agent->>ActionTool: cancel_order(order_id="NC-10002", requesting_customer_id="CUS-001")

    ActionTool->>DB: Query Order NC-10002 (Owner: "CUS-001", Status: "Processing")
    
    alt Ownership & Status Validated
        ActionTool->>DB: Update order.status = "Cancelled"
        ActionTool->>DB: Restock product inventory (stock += ordered_quantity)
        DB-->>ActionTool: Commit transaction OK
        ActionTool-->>Agent: Return cancellation confirmation + 395,000 PKR refund timeline
    else Unauthorized Customer (e.g. CUS-002 attempts to cancel CUS-001 order)
        ActionTool-->>Agent: 🚨 SECURITY DENIED: Unauthorized customer access
    end

    Agent->>Widget: Deliver formatted cancellation status & restock receipt
    Widget-->>Customer: Displays order cancellation confirmation
```

---

## 4. Multi-Provider Search Scraper Architecture

```mermaid
flowchart LR
    subgraph INTAKE ["1. Query Intake"]
        Q["User Live Query<br/>(e.g. '2026 AI laptop developments')"]
    end

    subgraph ROUTER ["2. Dynamic Engine Selector"]
        SELECT{"ContextVar Router<br/>(User Choice in UI)"}
    end

    subgraph ENGINES ["3. Specialized Search Providers"]
        E1["🌐 Google Serper.dev<br/>• Google News (qdr:w filter)<br/>• Google Search (qdr:d filter)"]
        E2["🦅 Tavily AI Search<br/>• topic='news'<br/>• time_range='w' (Past 7 Days)"]
        E3["📡 GDELT Project Doc 2.0<br/>• 100% Free Global News DB<br/>• 100+ Languages (sourcelang:eng)<br/>• 24h Recency Sort"]
        E4["🦆 DuckDuckGo Engine<br/>• timelimit='w'<br/>• Privacy-Preserving Fallback"]
    end

    subgraph DIVERSITY ["4. Domain Diversity & Sanitization Engine"]
        FILTER["Publisher Domain Deduplicator<br/>• At most 1 article per unique news domain<br/>• Strips raw markdown headers & boilerplate<br/>• Up to 10 rich information chunks"]
    end

    subgraph OUTPUT ["5. Structured Output to LLM"]
        RES["Clean Structured Citations<br/>(Headline, Published Timestamp, Publisher, Source URL, Summary)"]
    end

    Q --> SELECT
    SELECT -->|Option: serper| E1
    SELECT -->|Option: tavily| E2
    SELECT -->|Option: gdelt| E3
    SELECT -->|Option: duckduckgo| E4

    E1 --> FILTER
    E2 --> FILTER
    E3 --> FILTER
    E4 --> FILTER

    FILTER --> RES
```

---

## 5. Relational Database Schema (PostgreSQL / SQLite)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_in
    CATEGORIES ||--o{ PRODUCTS : categorizes
    ORDERS ||--o{ RETURN_REQUESTS : generates
    USERS ||--o{ SUPPORT_TICKETS : opens

    USERS {
        string id PK "CUS-001 (Ali Raza)"
        string name "Customer Name"
        string email "ali.raza@example.pk"
        string phone "+92 300 1234567"
        string address "House 42-B, Street 9, F-7/2"
        string city "Islamabad"
        datetime created_at
    }

    CATEGORIES {
        string id PK "laptops, smartphones, audio, tablets"
        string name "Category Title"
        string slug "laptops"
    }

    PRODUCTS {
        string id PK "P-1001 (Apple MacBook Pro 16 M3 Max)"
        string name "Product Display Name"
        string category "Laptops"
        float price "485000 PKR"
        float original_price "550000 PKR"
        int stock "8 (Live Real-Time Inventory)"
        json specs "CPU, RAM, SSD, Display, Battery, Warranty"
        string image_url "CDN Product Image"
        float rating "5.0"
    }

    ORDERS {
        string id PK "NC-10001"
        string customer_id FK "CUS-001"
        string status "Processing | Shipped | Delivered | Cancelled"
        float total_amount "485000 PKR"
        string shipping_address "Delivery Location"
        string courier "Leopard Express / TCS"
        string tracking_number "LP-884920"
        datetime created_at
    }

    ORDER_ITEMS {
        int id PK
        string order_id FK
        string product_id FK
        int quantity "1"
        float unit_price "485000"
    }

    RETURN_REQUESTS {
        string id PK "RMA-8921"
        string order_id FK "NC-10001"
        string customer_id FK "CUS-001"
        string reason "Customer return reason"
        string status "Approved | Pending"
        datetime created_at
    }

    SUPPORT_TICKETS {
        string id PK "TCK-104"
        string customer_id FK "CUS-001"
        string subject "Support inquiry / address update"
        string priority "High | Medium | Low"
        string status "Open | Escalated | Resolved"
        datetime created_at
    }
```

---

## 6. Architecture Roadmap & Milestone Tracker

| Phase | Milestone | Status | Key Implementations & Components |
| :--- | :--- | :---: | :--- |
| **Phase 01** | **NovaCart Storefront Frontend** | ✅ **Done** | Next.js 14 Storefront, 12 Flagship Tech Products (Apple, Samsung, Dell, Lenovo, ASUS, Google, Sony), Cart (`/cart`), Checkout (`/checkout`), Order Tracking (`/orders`), and Embedded Floating Nova AI Widget. |
| **Phase 02** | **Relational Database & Store Backend** | ⏳ **Next** | PostgreSQL / SQLite database with SQLAlchemy ORM models replacing static CSV files, seed migrations, and storefront REST endpoints. |
| **Phase 03** | **Live AI Widget & Context Bridge** | 📋 **Planned** | Real-time browser page context transmission (`viewing_product`, `cart_state`), SSE token streaming, and dynamic quick-action prompts. |
| **Phase 04** | **SQL Database Agentic Tools** | 📋 **Planned** | Live database-backed `search_products`, `get_order_status`, and `check_inventory` with real-time stock counters. |
| **Phase 05** | **Context-Aware RAG & Policy Grounding** | 📋 **Planned** | Dual-source synthesis combining live database product specs with official ChromaDB vector policy documents. |
| **Phase 06** | **Autonomous Agentic Actions** | 📋 **Planned** | Self-service order cancellations with automated stock replenishment, RMA return request generation, and support tickets. |
| **Phase 07** | **Authentication & Multi-Tenant Security** | 📋 **Planned** | JWT session token verification and cross-customer authorization barriers (`customer_id` ownership checks). |
| **Phase 08** | **Production Analytics & Deployment** | 📋 **Planned** | Live sales analytics dashboard, automated executive PowerPoint presentation generation (`.pptx`) from SQL data, and Docker Compose orchestration. |
