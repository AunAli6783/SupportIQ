from typing import Optional
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
        order_id: The order tracking number (e.g. 'NC-10003', 'NC-10001').
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

        return (
            f"Order Details for {order.id}:\n"
            f"- Customer ID: {order.customer_id}\n"
            f"- Order Status: {order.status}\n"
            f"- Total Amount: PKR {order.total_amount:,.0f}\n"
            f"- Courier: {order.courier}\n"
            f"- Tracking Number: {tracking_str}\n"
            f"- Shipping Address: {order.shipping_address}\n"
            f"- Ordered Items: {items_str}\n"
            f"- Estimated Delivery: {expected_str}"
        )
    except Exception as e:
        logger.error(f"Error executing get_order_status: {str(e)}")
        return f"Order System Error: Unable to query order status at this time. Details: {str(e)}"
    finally:
        db.close()
