from datetime import datetime
from sqlalchemy import (
    Column, 
    String, 
    Integer, 
    Float, 
    DateTime, 
    ForeignKey, 
    JSON, 
    Text, 
    Boolean
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    """Customer account record supporting authentication & profile management."""
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True) # e.g. "CUS-001"
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), default="Islamabad")
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    return_requests = relationship("ReturnRequest", back_populates="customer")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Category(Base):
    """Product catalog category."""
    __tablename__ = "categories"
    
    id = Column(String(50), primary_key=True) # e.g. "laptops", "smartphones"
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    icon = Column(String(50), nullable=True)
    
    products = relationship("Product", back_populates="category_rel")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "icon": self.icon
        }


class Product(Base):
    """Live tech hardware item with real-time inventory counter and specifications."""
    __tablename__ = "products"
    
    id = Column(String(50), primary_key=True) # e.g. "P-1001", "NB-P14-32"
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(50), nullable=False, index=True) # Apple, Samsung, Dell, Lenovo, etc.
    category = Column(String(100), nullable=False, index=True) # Laptops, Smartphones, etc.
    category_id = Column(String(50), ForeignKey("categories.id"), nullable=True)
    price = Column(Float, nullable=False) # PKR
    original_price = Column(Float, nullable=True)
    discount_percent = Column(Integer, default=0)
    stock = Column(Integer, default=0, nullable=False) # Real-time stock counter
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    specs = Column(JSON, nullable=True) # CPU, RAM, Storage, Display, Warranty, etc.
    featured = Column(Boolean, default=False)
    best_deal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    category_rel = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "category": self.category,
            "price": self.price,
            "original_price": self.original_price or self.price,
            "discount_percent": self.discount_percent,
            "stock": self.stock,
            "rating": self.rating,
            "reviews_count": self.reviews_count,
            "image": self.image_url,
            "tagline": self.tagline,
            "description": self.description,
            "specs": self.specs or {},
            "featured": self.featured,
            "best_deal": self.best_deal
        }


class Order(Base):
    """Customer purchase order with courier tracking and real-time lifecycle status."""
    __tablename__ = "orders"
    
    id = Column(String(50), primary_key=True) # e.g. "NC-10001"
    customer_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(50), default="Processing", index=True) # Processing, Shipped, Delivered, Cancelled
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(String(255), nullable=False)
    courier = Column(String(100), default="Leopard Express")
    tracking_number = Column(String(100), nullable=True)
    payment_method = Column(String(100), default="Cash on Delivery (COD)")
    created_at = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(String(50), nullable=True)
    
    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    return_requests = relationship("ReturnRequest", back_populates="order")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.name if self.customer else None,
            "status": self.status,
            "total_amount": self.total_amount,
            "shipping_address": self.shipping_address,
            "courier": self.courier,
            "tracking_number": self.tracking_number,
            "payment_method": self.payment_method,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expected_delivery": self.expected_delivery,
            "items": [item.to_dict() for item in self.items]
        }


class OrderItem(Base):
    """Line item belonging to an Order."""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False, index=True)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "name": self.product_name,
            "quantity": self.quantity,
            "price": self.unit_price,
            "subtotal": self.subtotal,
            "image": self.image_url
        }


class ReturnRequest(Base):
    """Customer return/RMA request."""
    __tablename__ = "return_requests"
    
    id = Column(String(50), primary_key=True) # e.g. "RMA-1001"
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False, index=True)
    customer_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String(50), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="Pending") # Pending, Approved, Rejected, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="return_requests")
    customer = relationship("User", back_populates="return_requests")

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "product_id": self.product_id,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
