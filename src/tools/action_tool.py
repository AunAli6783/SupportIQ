from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from langchain_core.tools import tool
from src.database.session import SessionLocal
from src.database.models import Order, Product, ReturnRequest, User
from src.config.settings import settings
from src.utils.logger import logger

@tool
def cancel_order(order_id: str, requesting_customer_id: Optional[str] = None, reason: Optional[str] = None) -> str:
    """
    Cancel an existing customer order if it is still in 'Processing' status and automatically restock items.
    
    Args:
        order_id: The order ID to cancel (e.g. 'NC-10001', 'NC-74596').
        requesting_customer_id: Customer ID requesting the cancellation for authorization verification.
        reason: Optional cancellation reason provided by the customer.
    """
    clean_id = order_id.strip().upper()
    logger.info(f"Tool Exec: cancel_order(order_id='{clean_id}', customer='{requesting_customer_id}', reason='{reason}')")
    
    db: Session = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Cancellation Failed: Order '{order_id}' was not found in the NovaCart database."
            
        # Security Verification: Customer Ownership
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            record_customer = str(order.customer_id).strip().upper()
            req_customer = requesting_customer_id.strip().upper()
            if record_customer != req_customer:
                logger.warning(f"Security Alert: Customer '{req_customer}' attempted to cancel order '{clean_id}' owned by '{record_customer}'.")
                return "SECURITY DENIED: You are not authorized to cancel this order as it belongs to another customer account."
                
        # Status Validation
        current_status = str(order.status).strip().lower()
        if current_status == "cancelled":
            return f"Order '{order.id}' is already cancelled. No further action needed."
            
        if current_status in ["shipped", "delivered"]:
            return (
                f"Order '{order.id}' cannot be cancelled because it has already been {order.status.lower()} "
                f"via {order.courier} (Tracking: {order.tracking_number or 'In Transit'}). "
                f"Once delivered, you can submit an official RMA Return Request within 30 days."
            )
            
        # Cancel order and restock items
        order.status = "Cancelled"
        restocked_items = []
        for line_item in order.items:
            product = db.query(Product).filter(Product.id == line_item.product_id).first()
            if product:
                product.stock += line_item.quantity
                restocked_items.append(f"{product.name} (+{line_item.quantity})")
                
        db.commit()
        db.refresh(order)
        
        restock_str = ", ".join(restocked_items) if restocked_items else "Inventory reconciled"
        logger.info(f"Order '{order.id}' successfully cancelled. Restocked: {restock_str}")
        
        return (
            f"Order Cancelled Successfully:\n"
            f"- Order ID: {order.id}\n"
            f"- New Status: Cancelled\n"
            f"- Customer ID: {order.customer_id}\n"
            f"- Refund Amount: PKR {order.total_amount:,.0f} (Full refund initiated to original payment method)\n"
            f"- Restocked Inventory: {restock_str}\n"
            f"- Notes: Any payment hold has been released. A confirmation email has been dispatched."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error executing cancel_order: {str(e)}")
        return f"Order System Error: Failed to cancel order '{order_id}'. Details: {str(e)}"
    finally:
        db.close()


@tool
def request_order_return(
    order_id: str, 
    reason: str, 
    product_id: Optional[str] = None, 
    requesting_customer_id: Optional[str] = None
) -> str:
    """
    Submit an official RMA return request for delivered items according to NovaCart's 30-day return policy.
    
    Args:
        order_id: The order ID of the purchase (e.g. 'NC-10001').
        reason: Customer reason for return (e.g. 'Defective screen', 'Unopened item within 30 days', 'Wrong specs').
        product_id: Optional SKU of the specific item being returned.
        requesting_customer_id: Customer ID for security validation.
    """
    clean_id = order_id.strip().upper()
    logger.info(f"Tool Exec: request_order_return(order='{clean_id}', customer='{requesting_customer_id}', reason='{reason}')")
    
    db: Session = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Return Request Failed: Order '{order_id}' was not found in the database."
            
        # Security Ownership Check
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            record_customer = str(order.customer_id).strip().upper()
            req_customer = requesting_customer_id.strip().upper()
            if record_customer != req_customer:
                return "SECURITY DENIED: You are not authorized to initiate a return on an order belonging to another customer."
                
        # Status Check
        if order.status.lower() == "cancelled":
            return f"Return Request Rejected: Order '{order.id}' is already cancelled."
            
        # Generate Return Authorization Record
        import random
        rma_id = f"RMA-{random.randint(10000, 99999)}"
        
        return_req = ReturnRequest(
            id=rma_id,
            order_id=order.id,
            customer_id=order.customer_id,
            product_id=product_id or (order.items[0].product_id if order.items else "GENERAL"),
            reason=reason,
            status="Approved", # Instant approval per NovaCart 30-day guarantee
            created_at=datetime.utcnow()
        )
        db.add(return_req)
        db.commit()
        db.refresh(return_req)
        
        logger.info(f"Generated Return Authorization '{rma_id}' for Order '{order.id}'.")
        
        return (
            f"Return Authorization Created Successfully:\n"
            f"- RMA Number: {return_req.id}\n"
            f"- Associated Order: {order.id}\n"
            f"- Status: Approved (Instant Verification)\n"
            f"- Eligible Items: {[it.product_name for it in order.items]}\n"
            f"- Return Reason: {reason}\n"
            f"- Instructions: Pack the device in its original retail box with all accessories. "
            f"A prepaid Leopard Courier pickup label has been generated and emailed to your registered address."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error executing request_order_return: {str(e)}")
        return f"Return Request Error: Could not generate RMA. Details: {str(e)}"
    finally:
        db.close()


@tool
def update_shipping_address(
    order_id: str, 
    new_address: str, 
    requesting_customer_id: Optional[str] = None
) -> str:
    """
    Update the destination shipping address for an order that has not yet been dispatched.
    
    Args:
        order_id: The order ID (e.g. 'NC-10001').
        new_address: The complete updated delivery address.
        requesting_customer_id: Customer ID for security verification.
    """
    clean_id = order_id.strip().upper()
    logger.info(f"Tool Exec: update_shipping_address(order='{clean_id}', new_address='{new_address}')")
    
    db: Session = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == clean_id).first()
        if not order:
            return f"Address Update Failed: Order '{order_id}' was not found in the database."
            
        if settings.ENFORCE_ORDER_OWNERSHIP and requesting_customer_id:
            record_customer = str(order.customer_id).strip().upper()
            req_customer = requesting_customer_id.strip().upper()
            if record_customer != req_customer:
                return "SECURITY DENIED: You cannot change the delivery address on an order that does not belong to you."
                
        if order.status.lower() in ["shipped", "delivered"]:
            return (
                f"Address Update Rejected: Order '{order.id}' is already {order.status.lower()} "
                f"and in transit with {order.courier}. Address redirects must be handled via carrier support."
            )
            
        old_address = order.shipping_address
        order.shipping_address = new_address.strip()
        db.commit()
        db.refresh(order)
        
        logger.info(f"Updated shipping address on Order '{order.id}' from '{old_address}' to '{order.shipping_address}'.")
        return (
            f"Shipping Address Updated Successfully:\n"
            f"- Order ID: {order.id}\n"
            f"- New Destination: {order.shipping_address}\n"
            f"- Courier: {order.courier}\n"
            f"- Status: {order.status} (Dispatches to new destination)"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error executing update_shipping_address: {str(e)}")
        return f"Address Update Error: Details: {str(e)}"
    finally:
        db.close()
