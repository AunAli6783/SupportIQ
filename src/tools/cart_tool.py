import json
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from langchain_core.tools import tool

from src.database.session import SessionLocal
from src.database.models import Product, CartItem, User
from src.utils.logger import logger

def _resolve_product(db: Session, product_id_or_name: str) -> Optional[Product]:
    """Helper to resolve a product by exact ID or fuzzy name match."""
    p_clean = product_id_or_name.strip()
    
    # 1. Try exact ID
    prod = db.query(Product).filter(Product.id.ilike(p_clean)).first()
    if prod:
        return prod
        
    # 2. Try exact Name
    prod = db.query(Product).filter(Product.name.ilike(p_clean)).first()
    if prod:
        return prod
        
    # 3. Try partial keyword search
    keywords = [k for k in p_clean.lower().split() if len(k) > 2]
    query = db.query(Product)
    for kw in keywords[:3]:
        query = query.filter(Product.name.ilike(f"%{kw}%"))
    prod = query.first()
    if prod:
        return prod

    # 4. Fallback search on brand + name
    pattern = f"%{p_clean}%"
    return db.query(Product).filter(
        or_(Product.name.ilike(pattern), Product.id.ilike(pattern))
    ).first()


@tool
def add_to_cart(product_id_or_name: str, customer_id: Optional[str] = "CUS-001", quantity: int = 1) -> str:
    """
    Add a tech product to the customer's real-time shopping cart in the database.
    ALWAYS call this tool when the customer asks to add an item to their cart or buy an item.
    Never claim an item has been added without invoking this tool.
    
    Args:
        product_id_or_name: Product SKU ID (e.g. 'P-1005', 'P-1001') or name (e.g. 'iPhone 18 Pro Max', 'MacBook Pro 16').
        customer_id: Verified customer account ID (e.g. 'CUS-001', 'CUS-002', 'CUS-003'). Defaults to 'CUS-001'.
        quantity: Number of units to add (default is 1).
    """
    target_cust = (customer_id or "CUS-001").strip()
    qty = max(1, quantity or 1)
    logger.info(f"Tool Exec: add_to_cart(product='{product_id_or_name}', customer_id='{target_cust}', quantity={qty})")
    
    db: Session = SessionLocal()
    try:
        # Ensure customer exists in database
        cust = db.query(User).filter(User.id == target_cust).first()
        if not cust:
            cust = User(
                id=target_cust,
                name="Valued Customer",
                email=f"{target_cust.lower()}@novacart.pk",
                phone="+92 300 1234567",
                city="Islamabad"
            )
            db.add(cust)
            db.flush()

        product = _resolve_product(db, product_id_or_name)
        if not product:
            return f"❌ Could not find product matching '{product_id_or_name}' in the SWOO TECH MART catalog. Please verify product name."

        if product.stock <= 0:
            return f"⚠️ '{product.name}' is currently out of stock. Would you like to be notified when it arrives?"

        # Check existing cart item for customer
        cart_item = db.query(CartItem).filter(
            CartItem.customer_id == target_cust,
            CartItem.product_id == product.id
        ).first()

        if cart_item:
            cart_item.quantity += qty
        else:
            cart_item = CartItem(
                customer_id=target_cust,
                product_id=product.id,
                quantity=qty
            )
            db.add(cart_item)

        db.commit()
        db.refresh(cart_item)

        result_payload = {
            "status": "success",
            "action": "add_to_cart",
            "customer_id": target_cust,
            "product_id": product.id,
            "product_name": product.name,
            "brand": product.brand,
            "quantity": cart_item.quantity,
            "unit_price": product.price,
            "subtotal": product.price * cart_item.quantity,
            "image": product.image_url,
            "message": f"Successfully added {product.name} (Qty: {qty}) to cart. Total cart quantity for this item is now {cart_item.quantity}."
        }
        
        logger.info(f"Successfully added '{product.name}' to cart in database for customer '{target_cust}'.")
        return f"CART_ACTION_SUCCESS: {json.dumps(result_payload)}"

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add to cart in database: {e}")
        return f"❌ Failed to add item to cart due to database error: {str(e)}"
    finally:
        db.close()


@tool
def remove_from_cart(product_id_or_name: str, customer_id: Optional[str] = "CUS-001") -> str:
    """
    Remove an item from the customer's real-time database cart.
    
    Args:
        product_id_or_name: Product SKU ID or product name.
        customer_id: Customer ID (e.g. 'CUS-001').
    """
    target_cust = (customer_id or "CUS-001").strip()
    logger.info(f"Tool Exec: remove_from_cart(product='{product_id_or_name}', customer_id='{target_cust}')")
    
    db: Session = SessionLocal()
    try:
        product = _resolve_product(db, product_id_or_name)
        if not product:
            return f"❌ Product '{product_id_or_name}' not found in catalog."

        cart_item = db.query(CartItem).filter(
            CartItem.customer_id == target_cust,
            CartItem.product_id == product.id
        ).first()

        if not cart_item:
            return f"ℹ️ '{product.name}' was not found in your cart."

        db.delete(cart_item)
        db.commit()

        result_payload = {
            "status": "success",
            "action": "remove_from_cart",
            "customer_id": target_cust,
            "product_id": product.id,
            "product_name": product.name,
            "message": f"Removed '{product.name}' from your shopping cart."
        }
        return f"CART_ACTION_SUCCESS: {json.dumps(result_payload)}"

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to remove item from cart: {e}")
        return f"❌ Failed to remove item from cart: {str(e)}"
    finally:
        db.close()


@tool
def get_customer_cart(customer_id: Optional[str] = "CUS-001") -> str:
    """
    Retrieve all items currently stored in the customer's database shopping cart.
    
    Args:
        customer_id: Customer ID (e.g. 'CUS-001').
    """
    target_cust = (customer_id or "CUS-001").strip()
    logger.info(f"Tool Exec: get_customer_cart(customer_id='{target_cust}')")
    
    db: Session = SessionLocal()
    try:
        items = db.query(CartItem).filter(CartItem.customer_id == target_cust).all()
        if not items:
            return f"🛒 Shopping cart for customer '{target_cust}' is currently empty."

        lines = [f"🛒 Current Shopping Cart for {target_cust}:"]
        total_pkr = 0.0
        for idx, item in enumerate(items, 1):
            prod_name = item.product.name if item.product else item.product_id
            prod_price = item.product.price if item.product else 0.0
            subtotal = prod_price * item.quantity
            total_pkr += subtotal
            lines.append(f"{idx}. {prod_name} — Qty: {item.quantity} × PKR {prod_price:,.0f} = PKR {subtotal:,.0f}")

        total_usd = round(total_pkr / 280)
        lines.append(f"\n**Grand Total:** PKR {total_pkr:,.0f} (~${total_usd:,} USD)")
        if total_pkr >= 25000:
            lines.append("🚚 **Free Express Shipping** is applied!")
        return "\n".join(lines)

    except Exception as e:
        logger.error(f"Failed to query customer cart: {e}")
        return f"❌ Error retrieving cart: {str(e)}"
    finally:
        db.close()
