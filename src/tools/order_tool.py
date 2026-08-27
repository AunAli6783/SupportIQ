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

        tracking = row.get('tracking_number')
        tracking_str = tracking if pd.notna(tracking) and str(tracking).strip() != "" else "Not assigned yet"
        
        expected = row.get('expected_delivery')
        expected_str = expected if pd.notna(expected) and str(expected).strip() != "" else "N/A"

        return (
            f"Order Details for {row['order_id']}:\n"
            f"- Customer ID: {row.get('customer_id', 'N/A')}\n"
            f"- Product Name: {row.get('product_name', 'N/A')}\n"
            f"- Quantity: {row.get('quantity', 1)}\n"
            f"- Total Price: PKR {row.get('total_price', 'N/A')}\n"
            f"- Order Status: {row.get('status', 'N/A')}\n"
            f"- Tracking Number: {tracking_str}\n"
            f"- Order Date: {row.get('order_date', 'N/A')}\n"
            f"- Expected Delivery: {expected_str}"
        )
    except Exception as e:
        logger.error(f"Error executing get_order_status: {str(e)}")
        return f"Order System Error: Unable to query order status at this time. Details: {str(e)}"
