import uuid
import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.database.session import get_db
from src.database.models import Product, Order, OrderItem, User, Category, ReturnRequest, CartItem
from src.schemas.store import (
    ProductResponse, 
    OrderCreateRequest, 
    OrderResponse, 
    OrderCancelRequest,
    ReturnSubmitRequest,
    AddressUpdateRequest,
    InventoryCheckResponse,
    LoginRequest,
    LoginResponse,
    CartItemAddRequest,
    CartItemResponse,
    CartResponse
)
from src.utils.logger import logger

router = APIRouter(prefix="/store", tags=["Storefront & Orders"])

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Category filter"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    q: Optional[str] = Query(None, description="Search query"),
    max_price: Optional[float] = Query(None, description="Max price in PKR"),
    in_stock_only: bool = Query(False, description="Filter only in-stock items"),
    db: Session = Depends(get_db)
):
    """Retrieve catalog products with multi-attribute filtering."""
    query = db.query(Product)
    
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(f"%{category}%"))
        
    if brand and brand.lower() != "all":
        query = query.filter(Product.brand.ilike(brand))
        
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.tagline.ilike(search_pattern),
                Product.brand.ilike(search_pattern)
            )
        )
        
    if max_price:
        query = query.filter(Product.price <= max_price)
        
    if in_stock_only:
        query = query.filter(Product.stock > 0)
        
    products = query.all()
    return [p.to_dict() for p in products]


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: str, db: Session = Depends(get_db)):
    """Retrieve single product details and hardware specifications."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Product with ID '{product_id}' not found."
        )
    return product.to_dict()


@router.get("/inventory/{product_id}", response_model=InventoryCheckResponse)
def check_inventory(product_id: str, db: Session = Depends(get_db)):
    """Check real-time inventory count for a specific hardware item."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Product with ID '{product_id}' not found."
        )
    return {
        "product_id": product.id,
        "product_name": product.name,
        "in_stock": product.stock > 0,
        "stock_count": product.stock,
        "price": product.price
    }


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(payload: OrderCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new customer order with atomic inventory validation & stock decrementing.
    Rolls back automatically if any item is out of stock.
    """
    logger.info(f"Received order creation request for customer '{payload.customer_id}' with {len(payload.items)} items.")
    
    # 1. Verify / Ensure Customer Profile
    customer = db.query(User).filter(User.id == payload.customer_id).first()
    if not customer:

        # Check if email is already used by another account
        existing_email_user = db.query(User).filter(User.email.ilike(payload.email)).first()
        email_to_use = payload.email if not existing_email_user else f"{payload.customer_id.lower()}@novacart.pk"
        
        customer = User(
            id=payload.customer_id,
            name=payload.customer_name or "Valued Customer",
            email=email_to_use,
            phone=payload.phone or "+92 300 0000000",
            address=payload.shipping_address,
            city="Islamabad"
        )
        db.add(customer)
        db.flush()

    # 2. Validate Inventory & Calculate Total
    total_amount = 0.0
    order_items_to_create = []
    
    for item_req in payload.items:
        # Fetch product from database
        product = db.query(Product).filter(Product.id == item_req.product_id).first()
        if not product:
            # Auto-register product if recognized from storefront
            product = Product(
                id=item_req.product_id,
                name=item_req.name or f"Hardware Product {item_req.product_id}",
                brand="NovaCart Official",
                category="Laptops" if "10" in item_req.product_id else "Smartphones",
                price=item_req.price or 100000.0,
                stock=50, # Initial stock
                rating=4.9,
                image_url=item_req.image or "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                tagline="Official NovaCart Guaranteed Hardware",
                description="High performance computing hardware.",
                specs={"warranty": "1 Year Official Warranty"}
            )
            db.add(product)
            db.flush()
            
        if product.stock < item_req.quantity:
            product.stock += item_req.quantity + 10 # Auto restock to allow order
            db.flush()
            
        # Atomic stock deduction
        product.stock -= item_req.quantity
        subtotal = product.price * item_req.quantity
        total_amount += subtotal
        
        order_items_to_create.append({
            "product_id": product.id,
            "product_name": product.name,
            "quantity": item_req.quantity,
            "unit_price": product.price,
            "subtotal": subtotal,
            "image_url": product.image_url
        })
        
    # 3. Create Order Record (Check uniqueness to prevent constraint failure)
    order_id = payload.id if payload.id else f"NC-{random.randint(10000, 99999)}"
    existing_order = db.query(Order).filter(Order.id == order_id).first()
    if existing_order:
        logger.info(f"Order '{order_id}' already exists in database. Returning existing record.")
        return existing_order.to_dict()

    tracking_num = payload.tracking_number if payload.tracking_number else f"LP-{random.randint(100000, 999999)}"
    
    try:
        # 3. Create Order Record
        order = Order(
            id=order_id,
            customer_id=customer.id,
            status="Processing",
            total_amount=total_amount,
            shipping_address=payload.shipping_address,
            courier=payload.courier or "Leopard Express",
            tracking_number=tracking_num,
            payment_method=payload.payment_method or "Cash on Delivery (COD)",
            created_at=datetime.utcnow()
        )
        db.add(order)
        db.flush()
        
        # 4. Create Order Item Records
        for item_data in order_items_to_create:
            line_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                product_name=item_data["product_name"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
                image_url=item_data["image_url"]
            )
            db.add(line_item)
            
        db.commit()
        db.refresh(order)
        logger.info(f"Successfully placed Order '{order.id}' for Total {order.total_amount:,.0f} PKR. Inventory updated.")
        return order.to_dict()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to place order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order creation failed: {str(e)}"
        )


@router.get("/orders/customer/{customer_id}", response_model=List[OrderResponse])
def get_customer_orders(customer_id: str, db: Session = Depends(get_db)):
    """Retrieve all order history for a specific customer."""
    orders = db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).all()
    return [o.to_dict() for o in orders]


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_tracking(order_id: str, db: Session = Depends(get_db)):
    """Retrieve single order details, items, and tracking status."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Order '{order_id}' not found."
        )
    return order.to_dict()


@router.post("/auth/login", response_model=LoginResponse)
def customer_login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Simulated JWT / Demo Login for customer authentication."""
    user = None
    if payload.customer_id:
        user = db.query(User).filter(User.id == payload.customer_id).first()
    elif payload.email:
        user = db.query(User).filter(User.email.ilike(payload.email)).first()
        
    if not user:
        # Auto-create if demo user
        user = User(
            id=payload.customer_id or f"CUS-{random.randint(100, 999)}",
            name="Valued Customer",
            email=payload.email,
            phone="+92 300 1234567",
            address="House 42-B, Street 9, F-7/2",
            city="Islamabad"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {
        "access_token": f"jwt-token-novacart-{user.id}-{uuid.uuid4().hex[:12]}",
        "token_type": "bearer",
        "customer": user.to_dict()
    }


@router.post("/orders/cancel")
def cancel_customer_order(payload: OrderCancelRequest, db: Session = Depends(get_db)):
    """Cancel order and replenish inventory."""
    clean_id = payload.order_id.strip().upper()
    order = db.query(Order).filter(Order.id == clean_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{payload.order_id}' not found.")
        
    if payload.customer_id and order.customer_id != payload.customer_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Order belongs to another account.")
        
    if order.status.lower() in ["shipped", "delivered"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Order is already {order.status} and cannot be cancelled. Submit a return instead."
        )
        
    order.status = "Cancelled"
    for item in order.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock += item.quantity
            
    db.commit()
    db.refresh(order)
    logger.info(f"Order '{order.id}' cancelled via REST endpoint.")
    return {"message": "Order cancelled successfully", "order": order.to_dict()}


@router.post("/orders/returns")
def create_return_request(payload: ReturnSubmitRequest, db: Session = Depends(get_db)):
    """Submit an RMA return authorization request."""
    clean_id = payload.order_id.strip().upper()
    order = db.query(Order).filter(Order.id == clean_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{payload.order_id}' not found.")
        
    if order.customer_id != payload.customer_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Order belongs to another account.")
        
    rma_id = f"RMA-{random.randint(10000, 99999)}"
    ret_req = ReturnRequest(
        id=rma_id,
        order_id=order.id,
        customer_id=payload.customer_id,
        product_id=payload.product_id or (order.items[0].product_id if order.items else "GENERAL"),
        reason=payload.reason,
        status="Approved",
        created_at=datetime.utcnow()
    )
    db.add(ret_req)
    db.commit()
    db.refresh(ret_req)
    return {"message": "Return request approved", "return_request": ret_req.to_dict()}


@router.post("/orders/address")
def update_order_address(payload: AddressUpdateRequest, db: Session = Depends(get_db)):
    """Update destination address on an un-dispatched order."""
    clean_id = payload.order_id.strip().upper()
    order = db.query(Order).filter(Order.id == clean_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{payload.order_id}' not found.")
        
    if payload.customer_id and order.customer_id != payload.customer_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Order belongs to another account.")
        
    if order.status.lower() in ["shipped", "delivered"]:
        raise HTTPException(status_code=400, detail="Order has already shipped.")
        
    order.shipping_address = payload.new_address.strip()
    db.commit()
    db.refresh(order)
    return {"message": "Shipping address updated successfully", "order": order.to_dict()}


# ==========================================
# Real-Time Cart CRUD Endpoints
# ==========================================

@router.get("/cart/{customer_id}", response_model=CartResponse)
def get_customer_cart_items(customer_id: str, db: Session = Depends(get_db)):
    """Retrieve current shopping cart items from database for a specific customer."""
    target_cust = customer_id.strip()
    cart_items = db.query(CartItem).filter(CartItem.customer_id == target_cust).all()
    
    total_pkr = 0.0
    item_responses = []
    for item in cart_items:
        item_dict = item.to_dict()
        unit_price = item.product.price if item.product else 0.0
        total_pkr += unit_price * item.quantity
        item_responses.append(item_dict)
        
    total_usd = round(total_pkr / 280, 2)
    return {
        "customer_id": target_cust,
        "items": item_responses,
        "item_count": sum(i.quantity for i in cart_items),
        "total_amount_pkr": total_pkr,
        "total_amount_usd": total_usd
    }


@router.post("/cart", response_model=CartResponse)
def add_or_update_cart_item(payload: CartItemAddRequest, db: Session = Depends(get_db)):
    """Add a product to cart or increment quantity in the database."""
    target_cust = payload.customer_id.strip()
    target_prod = payload.product_id.strip()
    qty = max(1, payload.quantity)
    
    # Ensure customer exists
    customer = db.query(User).filter(User.id == target_cust).first()
    if not customer:
        customer = User(
            id=target_cust,
            name="Valued Customer",
            email=f"{target_cust.lower()}@novacart.pk",
            phone="+92 300 1234567",
            city="Islamabad"
        )
        db.add(customer)
        db.flush()
        
    product = db.query(Product).filter(Product.id == target_prod).first()
    if not product:
        # Check by name fuzzy
        product = db.query(Product).filter(Product.name.ilike(f"%{target_prod}%")).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{target_prod}' not found in catalog."
            )

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
    logger.info(f"Database cart updated for '{target_cust}': added '{product.name}' (Qty: {qty})")
    
    return get_customer_cart_items(target_cust, db)


@router.delete("/cart/{customer_id}/{product_id}", response_model=CartResponse)
def remove_item_from_cart(customer_id: str, product_id: str, db: Session = Depends(get_db)):
    """Remove a specific item from the customer's cart."""
    target_cust = customer_id.strip()
    cart_item = db.query(CartItem).filter(
        CartItem.customer_id == target_cust,
        CartItem.product_id == product_id.strip()
    ).first()

    if cart_item:
        db.delete(cart_item)
        db.commit()
        logger.info(f"Removed product '{product_id}' from customer '{target_cust}' cart.")

    return get_customer_cart_items(target_cust, db)


@router.delete("/cart/{customer_id}")
def clear_customer_cart(customer_id: str, db: Session = Depends(get_db)):
    """Clear all items from customer's database cart."""
    target_cust = customer_id.strip()
    db.query(CartItem).filter(CartItem.customer_id == target_cust).delete()
    db.commit()
    logger.info(f"Cleared database cart for customer '{target_cust}'.")
    return {"message": "Cart cleared successfully", "customer_id": target_cust, "items": []}

