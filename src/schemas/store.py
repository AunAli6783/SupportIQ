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
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

class OrderCreateRequest(BaseModel):
    id: Optional[str] = Field(default=None, description="Optional custom Order ID, e.g. NC-10025")
    customer_id: str = Field(..., description="Customer ID, e.g. CUS-001")
    customer_name: Optional[str] = "Valued Customer"
    email: Optional[str] = "customer@example.pk"
    phone: Optional[str] = "+92 300 0000000"
    shipping_address: str
    courier: Optional[str] = "Leopard Express"
    payment_method: Optional[str] = "Cash on Delivery (COD)"
    tracking_number: Optional[str] = None
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

class OrderCancelRequest(BaseModel):
    order_id: str
    customer_id: Optional[str] = None
    reason: Optional[str] = "Customer requested cancellation"

class ReturnSubmitRequest(BaseModel):
    order_id: str
    customer_id: str
    reason: str
    product_id: Optional[str] = None

class AddressUpdateRequest(BaseModel):
    order_id: str
    new_address: str
    customer_id: Optional[str] = None

class InventoryCheckResponse(BaseModel):
    product_id: str
    product_name: str
    in_stock: bool
    stock_count: int
    price: float

class LoginRequest(BaseModel):
    email: Optional[str] = None
    customer_id: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: Dict[str, Any]

class CartItemAddRequest(BaseModel):
    customer_id: str = Field(..., description="Customer ID, e.g. CUS-001")
    product_id: str = Field(..., description="Product SKU ID, e.g. P-1005")
    quantity: int = Field(default=1, gt=0, description="Quantity to add")

class CartItemResponse(BaseModel):
    id: int
    customer_id: str
    product_id: str
    quantity: int
    product: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None

class CartResponse(BaseModel):
    customer_id: str
    items: List[CartItemResponse]
    item_count: int
    total_amount_pkr: float
    total_amount_usd: float

