from typing import Optional, List
from sqlalchemy.orm import Session
from langchain_core.tools import tool
from src.database.session import SessionLocal
from src.database.models import Order
from src.config.settings import settings
from src.utils.logger import logger

@tool
def get_order_status(order_id: str, requesting_customer_id: Optional[str] = None) -> str:
    """
    Retrieve real-time order status, tracking number, line items, and estimated delivery from live database.
    
    Args:
        order_id: The order tracking number (e.g. 'NC-10003', 'NC-10001', 'NC-74596').
        requesting_customer_id: Optional ID of the requesting customer for security verification.
    """
    logger.info(f"Tool Exec: get_order_status(order_id='{order_id}', customer='{requesting_customer_id}')")
    
    clean_id = order_id.strip().upper()
    db: Session = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Order Error: Order ID '{order_id}' was not found in the NovaCart database."
            
        # Security Check: Enforce Customer Ownership
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            record_customer = str(order.customer_id).strip().upper()
            req_customer = requesting_customer_id.strip().upper()
            if record_customer != req_customer:
                logger.warning(
                    f"Security Alert: Customer '{req_customer}' attempted unauthorized access to order '{clean_id}' owned by '{record_customer}'"
                )
                return "SECURITY DENIED: You are not authorized to view the status of this order."

        items_summary = []
        for it in order.items:
            items_summary.append(f"{it.product_name} (Qty: {it.quantity}, Unit Price: PKR {it.unit_price:,.0f})")
        items_str = ", ".join(items_summary) if items_summary else "N/A"

        tracking_str = order.tracking_number if order.tracking_number else "Not assigned yet"
        expected_str = order.expected_delivery if order.expected_delivery else "1-3 business days"
        return_reqs = [f"RMA #{r.id} ({r.status}: {r.reason})" for r in order.return_requests]
        return_str = "; ".join(return_reqs) if return_reqs else "None"

        return (
            f"Order Details for {order.id}:\n"
            f"- Customer: {order.customer.name if order.customer else order.customer_id} (ID: {order.customer_id})\n"
            f"- Order Status: {order.status}\n"
            f"- Total Amount: PKR {order.total_amount:,.0f}\n"
            f"- Payment Method: {order.payment_method}\n"
            f"- Courier: {order.courier}\n"
            f"- Tracking Number: {tracking_str}\n"
            f"- Shipping Destination: {order.shipping_address}\n"
            f"- Purchased Items: {items_str}\n"
            f"- Estimated Delivery: {expected_str}\n"
            f"- Active Return Requests: {return_str}"
        )
    except Exception as e:
        logger.error(f"Error executing get_order_status: {str(e)}")
        return f"Order System Error: Unable to query order status at this time. Details: {str(e)}"
    finally:
        db.close()


@tool
def list_customer_orders(customer_id: str) -> str:
    """
    Retrieve all past and active purchase orders for a customer account.
    
    Args:
        customer_id: The customer ID (e.g. 'CUS-001', 'CUS-002', 'CUS-003').
    """
    logger.info(f"Tool Exec: list_customer_orders(customer_id='{customer_id}')")
    clean_cus_id = customer_id.strip().upper()
    db: Session = SessionLocal()
    try:
        orders = db.query(Order).filter(Order.customer_id == clean_cus_id).order_by(Order.created_at.desc()).all()
        if not orders:
            return f"No orders found for customer ID '{clean_cus_id}' in the database."
            
        summary = [f"Purchase History for {clean_cus_id} ({len(orders)} total orders):"]
        for o in orders:
            item_names = [it.product_name for it in o.items]
            items_preview = ", ".join(item_names[:2]) + ("..." if len(item_names) > 2 else "")
            summary.append(
                f"• [{o.id}] Status: {o.status} | Total: PKR {o.total_amount:,.0f} | Date: {o.created_at.strftime('%Y-%m-%d')} | Items: {items_preview}"
            )
        return "\n".join(summary)
    except Exception as e:
        logger.error(f"Error executing list_customer_orders: {str(e)}")
        return f"Customer Order System Error: {str(e)}"
    finally:
        db.close()
