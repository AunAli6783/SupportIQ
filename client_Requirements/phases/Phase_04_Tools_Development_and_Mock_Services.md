# Phase 04: Custom Tool Suite and Business Backend

> **Phase Status:** Planned  
> **Prerequisites:** Phase 03 Completed (RAG retriever operational)  
> **Target Outcome:** Operational tool suite wrapped with LangChain `@tool` decorators for Order API access, Product Catalog search, Safe Arithmetic evaluation, RAG Knowledge Base lookup, and Human Escalation handling.

---

## 1. Objective

Develop isolated, secure, single-responsibility tool functions that allow the LLM agent to interact safely with external business systems (orders CSV data, product catalog CSV data, calculator engine, RAG search engine, and escalation service).

---

## 2. Tool Architecture Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SUPPORTIQ TOOL SUITE ARCHITECTURE                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

 1. Order Status Tool (`get_order_status`)
 ├── Data Source: `data/orders.csv`
 └── Security: Verifies `requesting_customer_id` matches order ownership before returning details.

 2. Product Search Tool (`search_products`)
 ├── Data Source: `data/products.csv`
 └── Functionality: Case-insensitive search across name, category, and hardware specifications.

 3. Safe Calculator Tool (`calculate`)
 ├── Engine: `numexpr` / AST Sandbox (No Python `eval()`)
 └── Functionality: Computes percentages, discounts, taxes, and refund totals safely.

 4. RAG Knowledge Tool (`search_knowledge_base`)
 ├── Engine: Phase 03 MMR Vector Retriever
 └── Functionality: Searches policy docs, FAQs, and company manuals for grounded answers.

 5. Human Escalation Tool (`escalate_to_human`)
 ├── Engine: Support Ticket Mock Dispatcher
 └── Functionality: Flags double charges, fraud suspicions, legal complaints, and unhandled issues.
```

---

## 3. Implementation Components

### Step 4.1: Order Management System Service (`src/tools/order_tool.py`)
Simulate real-time Order API lookups backed by `data/orders.csv` with built-in permission checks.

```python
import pandas as pd
from typing import Optional, Dict, Any
from pathlib import Path
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger
from src.utils.exceptions import SecurityAccessDeniedError

ORDERS_CSV_PATH = settings.KNOWLEDGE_BASE_DIR / "data" / "orders.csv"

def _load_orders_df() -> pd.DataFrame:
    """Load order data from CSV storage."""
    if not ORDERS_CSV_PATH.exists():
        raise FileNotFoundError(f"Orders data file missing at {ORDERS_CSV_PATH}")
    return pd.read_csv(ORDERS_CSV_PATH)

@tool
def get_order_status(order_id: str, requesting_customer_id: Optional[str] = None) -> str:
    """
    Retrieve real-time order status, tracking number, items, and estimated delivery.
    
    Args:
        order_id: The order tracking number (e.g. 'NC-10003').
        requesting_customer_id: Optional ID of the requesting customer for security verification.
    """
    logger.info(f"Tool Exec: get_order_status(order_id='{order_id}', customer='{requesting_customer_id}')")
    
    try:
        df = _load_orders_df()
        # Clean order_id string match
        clean_id = order_id.strip().upper()
        matching = df[df["order_id"].str.strip().str.upper() == clean_id]

        if matching.empty:
            return f"Order Error: Order ID '{order_id}' was not found in NovaCart system."

        row = matching.iloc[0].to_dict()

        # Security Check: Enforce Customer Ownership
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            record_customer = str(row.get("customer_id", "")).strip().upper()
            req_customer = requesting_customer_id.strip().upper()
            if record_customer != req_customer:
                logger.warning(f"Security Alert: Customer '{req_customer}' attempted unauthorized access to order '{clean_id}' owned by '{record_customer}'")
                return "SECURITY DENIED: You are not authorized to view the status of this order."

        return (
            f"Order Details for {row['order_id']}:\n"
            f"- Customer ID: {row.get('customer_id', 'N/A')}\n"
            f"- Product: {row.get('product_name', row.get('items', 'N/A'))}\n"
            f"- Status: {row.get('order_status', row.get('status', 'N/A'))}\n"
            f"- Tracking Number: {row.get('tracking_number', 'N/A')}\n"
            f"- Expected Delivery: {row.get('expected_delivery', 'N/A')}\n"
            f"- Shipping Carrier: {row.get('carrier', 'Standard Delivery')}"
        )
    except Exception as e:
        logger.error(f"Error executing get_order_status: {str(e)}")
        return f"Order System Error: Unable to query order status at this time. Details: {str(e)}"
```

### Step 4.2: Product Search Tool (`src/tools/product_tool.py`)
Enable product discovery and stock check from `data/products.csv`.

```python
import pandas as pd
from typing import Optional
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger

PRODUCTS_CSV_PATH = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"

@tool
def search_products(query: str, category: Optional[str] = None) -> str:
    """
    Search NovaCart product catalog for items matching a keyword, RAM specification, or category.
    
    Args:
        query: Search keywords (e.g., 'gaming laptop 32GB RAM', 'wireless mouse', 'NovaGame X16').
        category: Optional category filter ('laptops', 'smartphones', 'accessories').
    """
    logger.info(f"Tool Exec: search_products(query='{query}', category='{category}')")
    
    if not PRODUCTS_CSV_PATH.exists():
        return "Product System Error: Catalog database is unavailable."

    df = pd.read_csv(PRODUCTS_CSV_PATH)
    query_lower = query.lower()
    
    # Filter by category if provided
    if category:
        df = df[df["category"].str.lower() == category.lower()]

    # Case-insensitive keyword matching across product name, specifications, and description
    matches = df[
        df["name"].str.lower().str.contains(query_lower, na=False) |
        df["specs"].str.lower().str.contains(query_lower, na=False) |
        df["category"].str.lower().str.contains(query_lower, na=False)
    ]

    if matches.empty:
        return f"No products matching '{query}' were found in the NovaCart catalog."

    results = []
    for _, row in matches.iterrows():
        results.append(
            f"• Product: {row['name']} (ID: {row.get('product_id', 'N/A')})\n"
            f"  - Category: {row.get('category', 'N/A')}\n"
            f"  - Price: PKR {row.get('price_pkr', row.get('price', 'N/A'))}\n"
            f"  - Stock Availability: {row.get('stock_quantity', row.get('stock', 'In Stock'))} units\n"
            f"  - Specifications: {row.get('specs', 'N/A')}\n"
            f"  - Rating: {row.get('rating', '4.5')}/5.0"
        )

    return "\n\n".join(results)
```

### Step 4.3: Safe Calculator Tool (`src/tools/calculator_tool.py`)
Implement a sandbox calculator using `numexpr` to execute mathematical operations without security risks.

```python
import numexpr as ne
from langchain_core.tools import tool
from src.utils.logger import logger

@tool
def calculate(expression: str) -> str:
    """
    Safely evaluate arithmetic expressions for discount calculations, tax, total price, and refunds.
    Do NOT pass text or currency symbols (e.g. $, PKR). Pass raw expressions like '1200 * (1 - 0.15)' or '289999 * 0.15'.
    
    Args:
        expression: Mathematical expression string to evaluate (e.g. '500 * 0.20' or '1200 - 180').
    """
    logger.info(f"Tool Exec: calculate(expression='{expression}')")
    
    # Clean expression
    cleaned_expr = (
        expression.replace("$", "")
        .replace("PKR", "")
        .replace(",", "")
        .replace("=", "")
        .strip()
    )

    # Disallow dangerous characters or Python keywords
    invalid_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_`[];{}")
    if any(c in invalid_chars for c in cleaned_expr):
        return "Calculator Error: Invalid expression containing unauthorized string characters."

    try:
        result = ne.evaluate(cleaned_expr).item()
        # Format clean integer or float
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        return f"Calculation Result: {cleaned_expr} = {result}"
    except Exception as e:
        logger.error(f"Calculator evaluation failed for '{expression}': {str(e)}")
        return f"Calculator Error: Unable to evaluate expression '{expression}'."
```

### Step 4.4: RAG Knowledge Tool (`src/tools/knowledge_tool.py`)
Expose the Phase 03 retrieval engine as a standalone tool.

```python
from typing import Optional
from langchain_core.tools import tool
from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.utils.logger import logger

@tool
def search_knowledge_base(query: str, category_filter: Optional[str] = None) -> str:
    """
    Search NovaCart's official customer-support knowledge base for policy rules, returns, warranty, shipping, and FAQs.
    
    Args:
        query: Question or policy topic to query (e.g. 'What is the return period for opened electronics?').
        category_filter: Optional filter ('policy', 'company_info', 'faq', 'product_manual').
    """
    logger.info(f"Tool Exec: search_knowledge_base(query='{query}', filter='{category_filter}')")
    
    retriever = SupportIQRetriever()
    filter_dict = {"category": category_filter} if category_filter else None
    
    docs = retriever.get_relevant_documents(
        query=query, 
        search_type="mmr", 
        k=4, 
        metadata_filter=filter_dict
    )
    
    if not docs:
        return "Knowledge Base: No relevant documentation was found for this query."

    formatted_context, sources = CitationEngine.format_sources(docs)
    return formatted_context
```

### Step 4.5: Human Escalation Tool (`src/tools/escalation_tool.py`)
Dispatch support tickets for sensitive or unresolvable customer requests.

```python
from langchain_core.tools import tool
from src.utils.logger import logger

@tool
def escalate_to_human(customer_issue: str, priority: str = "HIGH", reason: str = "Unresolved") -> str:
    """
    Escalate customer issue to human support agent for double charges, legal disputes, fraud, or unhandled requests.
    
    Args:
        customer_issue: Detailed summary of customer's complaint or request.
        priority: Urgency level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').
        reason: Categorical reason ('billing_dispute', 'legal_complaint', 'low_confidence', 'customer_request').
    """
    logger.info(f"Tool Exec: escalate_to_human(priority='{priority}', reason='{reason}')")
    ticket_id = f"TICKET-NC-{hash(customer_issue) % 1000000:06d}"
    
    return (
        f"ESCALATION SUCCESSFUL:\n"
        f"- Ticket Reference: {ticket_id}\n"
        f"- Priority: {priority}\n"
        f"- Reason: {reason}\n"
        f"- Message to Customer: Your request has been escalated to NovaCart Senior Human Support. "
        f"A human agent will review ticket '{ticket_id}' within 24 hours."
    )
```

---

## 4. Verification & Test Plan

Create `tests/test_tools.py` to test tool output and security constraints.

```python
import pytest
from src.tools.order_tool import get_order_status
from src.tools.product_tool import search_products
from src.tools.calculator_tool import calculate
from src.tools.escalation_tool import escalate_to_human

def test_order_status_tool_success():
    res = get_order_status.invoke({"order_id": "NC-10003"})
    assert "Shipped" in res or "Delivered" in res or "Processing" in res or "Order Details" in res

def test_order_status_security_denied():
    res = get_order_status.invoke({"order_id": "NC-10003", "requesting_customer_id": "WRONG_CUST_999"})
    assert "SECURITY DENIED" in res

def test_calculator_tool():
    res = calculate.invoke({"expression": "1200 * 0.15"})
    assert "180" in res

def test_escalation_tool():
    res = escalate_to_human.invoke({"customer_issue": "Double charged on my credit card", "priority": "HIGH"})
    assert "TICKET-NC" in res
```

---

## 5. Phase 04 Checklist

- [ ] Implement `src/tools/order_tool.py` with cross-customer security check.
- [ ] Implement `src/tools/product_tool.py` querying `products.csv`.
- [ ] Implement `src/tools/calculator_tool.py` with `numexpr` safe evaluation.
- [ ] Implement `src/tools/knowledge_tool.py` wrapping the RAG retriever.
- [ ] Implement `src/tools/escalation_tool.py` for support ticket dispatch.
- [ ] Run `pytest tests/test_tools.py` to verify tool execution and security enforcement.
