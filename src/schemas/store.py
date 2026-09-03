from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price: float
    original_price: Optional[float] = None
    discount_percent: int = 0
    stock: int
    rating: float = 4.8
    reviews_count: int = 0
    image: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    specs: Dict[str, Any] = {}
    featured: bool = False
    best_deal: bool = False

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(gt=0, description="Quantity must be at least 1")

class OrderCreateRequest(BaseModel):
    customer_id: str = Field(..., description="Customer ID, e.g. CUS-001")
    customer_name: str
    email: str
    phone: str
    shipping_address: str
    courier: Optional[str] = "Leopard Express"
    payment_method: Optional[str] = "Cash on Delivery (COD)"
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: Optional[str] = None
    status: str
    total_amount: float
    shipping_address: str
    courier: str
    tracking_number: Optional[str] = None
    payment_method: Optional[str] = None
    created_at: Optional[str] = None
    items: List[Dict[str, Any]] = []

class InventoryCheckResponse(BaseModel):
    product_id: str
    product_name: str
    in_stock: bool
    stock_count: int
    price: float

class LoginRequest(BaseModel):
    email: str
    customer_id: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: Dict[str, Any]
