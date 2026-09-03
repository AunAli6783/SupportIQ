import uuid
import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.database.session import get_db
from src.database.models import Product, Order, OrderItem, User, Category
from src.schemas.store import (
    ProductResponse, 
    OrderCreateRequest, 
    OrderResponse, 
    InventoryCheckResponse,
    LoginRequest,
    LoginResponse
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
        customer = User(
            id=payload.customer_id,
            name=payload.customer_name,
            email=payload.email,
            phone=payload.phone,
            address=payload.shipping_address,
            city="Islamabad"
        )
        db.add(customer)
        db.flush()

    # 2. Validate Inventory & Calculate Total
    total_amount = 0.0
    order_items_to_create = []
    
    for item_req in payload.items:
        # Fetch with row-level intent
        product = db.query(Product).filter(Product.id == item_req.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{item_req.product_id}' does not exist."
            )
            
        if product.stock < item_req.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for '{product.name}'. Available: {product.stock}, Requested: {item_req.quantity}."
            )
            
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
        
    # 3. Create Order Record
    order_id = f"NC-{random.randint(10000, 99999)}"
    tracking_num = f"LP-{random.randint(100000, 999999)}"
    
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
