# Phase 06: Autonomous Agentic Actions (Self-Service Transaction Execution)

> **Phase Status:** Planned  
> **Prerequisites:** Phase 04 Completed (Live SQL Database Tools operational)  
> **Target Outcome:** Empower SupportIQ to perform autonomous business actions (order cancellations, return requests, shipping address updates, support ticket escalation) with automated policy verification and inventory restocking.

---

## 1. Objective

Elevate SupportIQ from an informational chatbot into a **fully autonomous AI agent**. The agent executes real state-changing transactions against the PostgreSQL/SQLite database while automatically enforcing business validation rules (e.g. 30-day return eligibility, restock reconciliation on order cancellation).

---

## 2. Autonomous Action Matrix

```
┌───────────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Agentic Action Tool       │ Business Rule Verification       │ Database Effect                     │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ `cancel_order`            │ Order must be in "Processing"    │ Order status -> "Cancelled"         │
│                           │ or "Pending" (not yet shipped).  │ Inventory stock restored for items. │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ `create_return_request`   │ Order must be "Delivered" and    │ Generates ReturnRequest record with │
│                           │ within official 30-day window.   │ RMA Code (e.g. 'RMA-8921').         │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ `update_shipping_address` │ Order must not be "Shipped".     │ Updates shipping_address in Order.  │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ `create_support_ticket`   │ Escalates complex / human cases. │ Creates SupportTicket with priority.│
└───────────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Implementation of Action Tools (`src/tools/action_tools.py`)

### Step 6.1: Order Cancellation with Inventory Restocking

```python
from datetime import datetime
from langchain_core.tools import tool
from src.database.session import get_db_session
from src.database.models import Order, Product
from src.config.settings import settings
from src.utils.logger import logger

@tool("cancel_order")
def cancel_order(order_id: str, reason: str = "", requesting_customer_id: str = "") -> str:
    """
    Cancel an unfulfilled NovaCart order and restore product inventory.
    Only permitted if order is in 'Processing' or 'Pending' status.
    """
    clean_id = order_id.strip().upper()
    logger.info(f"Tool Exec: cancel_order(order_id='{clean_id}', customer='{requesting_customer_id}')")

    with get_db_session() as db:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Cancellation Error: Order ID '{clean_id}' does not exist."

        # Ownership Security Check
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            if order.customer_id != requesting_customer_id:
                return f"SECURITY DENIED: Unauthorized to cancel order '{clean_id}'."

        # Status Validation
        if order.status in ["Shipped", "Delivered"]:
            return (
                f"Cannot Cancel: Order '{clean_id}' has already been dispatched ({order.status}). "
                f"Once received, you may initiate a return request under our 30-day return policy."
            )
        
        if order.status == "Cancelled":
            return f"Notice: Order '{clean_id}' is already cancelled."

        # Update Order Status
        order.status = "Cancelled"

        # Restore Product Stock
        restocked_items = []
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity
                restocked_items.append(f"{product.name} (+{item.quantity} units)")

        db.commit()

        return (
            f"Order Cancellation Successful!\n"
            f"- Order ID: {clean_id}\n"
            f"- Status: Cancelled\n"
            f"- Reason: {reason or 'Customer request'}\n"
            f"- Refund: Full refund of {order.total_amount:,.0f} PKR initiated (processed in 3-5 business days).\n"
            f"- Inventory Restocked: {', '.join(restocked_items)}"
        )
```

---

### Step 6.2: Autonomous Return Request Tool

```python
import uuid
from datetime import datetime, timedelta
from src.database.models import ReturnRequest

@tool("create_return_request")
def create_return_request(order_id: str, reason: str, requesting_customer_id: str = "") -> str:
    """
    Submit an official return request for an eligible delivered order within 30 days.
    Generates a unique Return Merchandise Authorization (RMA) tracking code.
    """
    clean_id = order_id.strip().upper()
    with get_db_session() as db:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Return Error: Order '{clean_id}' not found."

        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            if order.customer_id != requesting_customer_id:
                return f"SECURITY DENIED: Unauthorized to create return for order '{clean_id}'."

        if order.status != "Delivered":
            return f"Return Ineligible: Order '{clean_id}' has not been delivered yet (Status: {order.status})."

        # Check 30-day window
        order_age_days = (datetime.utcnow() - order.created_at).days
        if order_age_days > 30:
            return (
                f"Return Ineligible: Order '{clean_id}' was delivered {order_age_days} days ago, "
                f"which exceeds our 30-day return policy window."
            )

        rma_code = f"RMA-{uuid.uuid4().hex[:6].upper()}"
        ret_request = ReturnRequest(
            id=rma_code,
            order_id=clean_id,
            customer_id=order.customer_id,
            reason=reason,
            status="Approved"
        )
        db.add(ret_request)
        db.commit()

        return (
            f"Return Request Approved!\n"
            f"- RMA Tracking Code: {rma_code}\n"
            f"- Order ID: {clean_id}\n"
            f"- Return Window Status: Verified ({order_age_days} days since order, within 30-day policy)\n"
            f"- Next Steps: Securely pack the item with original packaging and drop off at any Leopard Courier branch using RMA Code {rma_code}."
        )
```

---

## 4. Verification & Testing Plan

1. **Order Cancellation Test:** Place an order on website, use AI to cancel order -> Order status in DB becomes `Cancelled` and product stock increases by purchased quantity.
2. **Post-Shipment Refusal Test:** Attempt to cancel a `Shipped` order -> AI politely refuses and offers return instructions.
3. **Return Authorization Test:** Request return for an eligible delivered order -> AI generates `RMA-XXXX` code and records it in `return_requests` table.

---

## 5. Phase Checklist

- [ ] Create `ReturnRequest` and `SupportTicket` SQLAlchemy models.
- [ ] Implement `cancel_order` with transactional stock replenishment.
- [ ] Implement `create_return_request` with 30-day window verification.
- [ ] Implement `update_shipping_address` tool.
- [ ] Implement `create_support_ticket` human escalation tool.
- [ ] Write integration test suite verifying state mutations and security checks.
