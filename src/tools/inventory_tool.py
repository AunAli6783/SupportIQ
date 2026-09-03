from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from langchain_core.tools import tool
from src.database.session import SessionLocal
from src.database.models import Product
from src.utils.logger import logger

@tool
def check_inventory(product_name_or_id: str) -> str:
    """
    Check real-time stock availability and inventory count for a hardware item in the NovaCart SQL database.
    
    Args:
        product_name_or_id: The product name or SKU (e.g., 'Samsung Galaxy S25', 'P-1002', 'MacBook Pro 16', 'P-1001').
    """
    logger.info(f"Tool Exec: check_inventory('{product_name_or_id}')")
    db: Session = SessionLocal()
    try:
        clean_query = product_name_or_id.strip()
        
        # 1. Exact ID match
        product = db.query(Product).filter(Product.id.ilike(clean_query)).first()
        
        # 2. Name search if not found by ID
        if not product:
            product = db.query(Product).filter(
                or_(
                    Product.name.ilike(f"%{clean_query}%"),
                    Product.tagline.ilike(f"%{clean_query}%")
                )
            ).first()
            
        if not product:
            return f"Inventory Check: Item '{product_name_or_id}' was not found in the NovaCart catalog."
            
        if product.stock > 0:
            return (
                f"Live Inventory for {product.name} (SKU: {product.id}):\n"
                f"- Availability: IN STOCK ({product.stock} units available)\n"
                f"- Price: PKR {product.price:,.0f}\n"
                f"- Official Warranty: {product.specs.get('warranty', '1 Year Official') if product.specs else '1 Year Official'}"
            )
        else:
            return (
                f"Live Inventory for {product.name} (SKU: {product.id}):\n"
                f"- Availability: CURRENTLY OUT OF STOCK (0 units)\n"
                f"- Price: PKR {product.price:,.0f}\n"
                f"- Status: Restocking in progress (Expected in 3-5 business days)"
            )
    except Exception as e:
        logger.error(f"Error checking inventory: {e}")
        return f"Inventory System Error: Unable to query stock at this time. Details: {str(e)}"
    finally:
        db.close()
