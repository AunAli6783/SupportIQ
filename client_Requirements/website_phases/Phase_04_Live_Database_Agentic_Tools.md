# Phase 04: Live Database Agentic Tools (SQLAlchemy ORM Data Tools)

> **Phase Status:** Planned  
> **Prerequisites:** Phase 02 Completed (Database & ORM models initialized)  
> **Target Outcome:** AI agent tools migrated from static CSV files to live SQLAlchemy database queries, providing real-time order tracking, dynamic inventory verification, and strict cross-customer permission security.

---

## 1. Objective

Upgrade SupportIQ's custom tool suite so that every tool executes against the **live relational database** rather than static CSV files. When customers make purchases or update addresses on the website, the AI immediately sees the changes in real time.

---

## 2. Tool Architecture & Database Interaction

```
                               AI AGENT EXECUTOR
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   get_order_status             search_products               check_inventory
 (Live SQL Order Lookup)      (Live Catalog Query)       (Real-Time Stock Counter)
         │                             │                             │
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ Permission Check │          │  Filter by Category,│       │ SELECT stock     │
│ order.customer_id│          │  Price & In-Stock│          │ FROM products    │
│  == user.id      │          │  ILIKE '%laptop%'│          │ WHERE id = :id   │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       ▼
                             PostgreSQL / SQLite
```

---

## 3. Tool Implementations

### Step 4.1: Live Order Status Tool (`src/tools/order_tool.py`)

```python
from langchain_core.tools import tool
from src.database.session import get_db_session
from src.database.models import Order, OrderItem, Product
from src.config.settings import settings
from src.utils.logger import logger

@tool("get_order_status")
def get_order_status(order_id: str, requesting_customer_id: str = "") -> str:
    """
    Look up real-time delivery and fulfillment status for a NovaCart order.
    Queries the live relational database and enforces strict cross-customer permission verification.
    """
    clean_id = order_id.strip().upper()
    logger.info(f"Tool Exec: get_order_status(order_id='{clean_id}', customer='{requesting_customer_id}')")

    with get_db_session() as db:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Order Error: Order ID '{clean_id}' was not found in NovaCart's live order database."

        # Security Ownership Enforcement
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            if order.customer_id != requesting_customer_id:
                return (
                    f"SECURITY DENIED: Customer ID '{requesting_customer_id}' is not authorized "
                    f"to access order '{clean_id}' belonging to another customer."
                )

        # Build order item breakdown
        items_summary = [
            f"• {item.product.name} (Qty: {item.quantity}) - {item.unit_price:,.0f} PKR"
            for item in order.items
        ]
        items_str = "\n".join(items_summary)

        return (
            f"Order Details for {clean_id}:\n"
            f"- Status: {order.status}\n"
            f"- Customer ID: {order.customer_id}\n"
            f"- Total Amount: {order.total_amount:,.0f} PKR\n"
            f"- Shipping Address: {order.shipping_address}\n"
            f"- Courier: {order.courier}\n"
            f"- Tracking Number: {order.tracking_number or 'Pending Dispatch'}\n"
            f"- Ordered On: {order.created_at.strftime('%Y-%m-%d %H:%M')}\n"
            f"- Items Purchased:\n{items_str}"
        )
```

---

### Step 4.2: Live Product Catalog Search (`src/tools/product_tool.py`)

```python
@tool("search_products")
def search_products(query: str = "", category: str = "", max_price: float = 0.0, in_stock_only: bool = False) -> str:
    """
    Search NovaCart's live product catalog in the database.
    Supports full-text keyword matching, category filtering, price ceiling, and live stock counts.
    """
    with get_db_session() as db:
        stmt = db.query(Product)
        if category:
            stmt = stmt.filter(Product.category.ilike(f"%{category}%"))
        if query:
            stmt = stmt.filter(Product.name.ilike(f"%{query}%") | Product.description.ilike(f"%{query}%"))
        if max_price > 0:
            stmt = stmt.filter(Product.price <= max_price)
        if in_stock_only:
            stmt = stmt.filter(Product.stock > 0)

        products = stmt.limit(6).all()
        if not products:
            return "No matching products found in the catalog."

        results = []
        for p in products:
            stock_status = f"{p.stock} units in stock" if p.stock > 0 else "Out of stock"
            results.append(
                f"• {p.name} (ID: {p.id})\n"
                f"  Price: {p.price:,.0f} PKR | Category: {p.category} | Availability: {stock_status}\n"
                f"  Specs: {p.specs}\n"
                f"  Description: {p.description}"
            )
        return "\n\n".join(results)
```

---

### Step 4.3: Real-Time Inventory Check (`src/tools/inventory_tool.py`)

```python
@tool("check_inventory")
def check_inventory(product_id_or_name: str) -> str:
    """
    Check real-time stock and inventory availability for a specific hardware model.
    """
    clean_query = product_id_or_name.strip()
    with get_db_session() as db:
        product = db.query(Product).filter(
            (Product.id == clean_query) | (Product.name.ilike(f"%{clean_query}%"))
        ).first()

        if not product:
            return f"Inventory Check: Product '{clean_query}' not found."

        if product.stock > 5:
            status = f"In Stock ({product.stock} units available for immediate dispatch)"
        elif product.stock > 0:
            status = f"Low Stock (Only {product.stock} units remaining!)"
        else:
            status = "Currently Out of Stock (Restock expected in 3-5 business days)"

        return f"Inventory Status for {product.name} ({product.id}): {status} | Price: {product.price:,.0f} PKR"
```

---

## 4. Verification & Testing Plan

1. **Live Purchase Sync Test:** Place an order via Next.js checkout (purchasing 2 units of `P-1001`), then immediately ask the AI *"Where is my new order?"* -> AI returns exact order ID and delivery status.
2. **Stock Decrement Test:** Query stock of `P-1001` before and after purchase -> AI reflects exact decremented count.
3. **Security Test:** Authenticate as `CUS-002` and ask for order `NC-10001` (belonging to `CUS-001`) -> AI triggers `SECURITY DENIED`.

---

## 5. Phase Checklist

- [ ] Refactor `order_tool.py` to query SQLAlchemy `Order` and `OrderItem` tables.
- [ ] Refactor `product_tool.py` to query SQLAlchemy `Product` table.
- [ ] Implement `inventory_tool.py` for exact real-time stock lookups.
- [ ] Verify security permission checks on live database queries.
- [ ] Add automated pytest suite verifying live database tool executions.
