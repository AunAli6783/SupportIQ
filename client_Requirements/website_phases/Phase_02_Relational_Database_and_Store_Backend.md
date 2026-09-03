# Phase 02: Relational Database & Store Backend (SQLAlchemy / PostgreSQL / SQLite)

> **Phase Status:** Planned  
> **Prerequisites:** Phase 01 Planned (Frontend layout understood)  
> **Target Outcome:** A normalized relational database replacing static CSV files with SQLAlchemy ORM models, an automated seed migration script, live inventory management, and high-performance FastAPI Storefront REST endpoints.

---

## 1. Objective

Transition SupportIQ and NovaCart from static CSV files (`products.csv`, `orders.csv`) to a live, production-grade relational database. The database powers both the **Next.js Storefront** and the **AI Support Agent**, providing a unified, real-time source of truth.

---

## 2. Database Schema Architecture

```
 ┌──────────────────────┐         ┌────────────────────────┐
 │        users         │         │       categories       │
 ├──────────────────────┤         ├────────────────────────┤
 │ id (PK: CUS-101)     │         │ id (PK)                │
 │ name                 │         │ name (e.g. 'Laptops')  │
 │ email                │         │ slug                   │
 │ phone                │         └───────────┬────────────┘
 │ address              │                     │ 1:N
 │ created_at           │                     ▼
 └──────────┬───────────┘         ┌────────────────────────┐
            │ 1:N                 │        products        │
            ▼                     ├────────────────────────┤
 ┌──────────────────────┐         │ id (PK: P-1001)        │
 │        orders        │         │ name                   │
 ├──────────────────────┤         │ description            │
 │ id (PK: NC-10001)    │         │ price (PKR)            │
 │ customer_id (FK)     │         │ stock (live inventory) │
 │ status (Processing)  │         │ category_id (FK)       │
 │ total_amount         │         │ specs (JSON)           │
 │ shipping_address     │         │ rating                 │
 │ tracking_number      │         │ image_url              │
 │ courier (Leopard)    │         └───────────┬────────────┘
 │ created_at           │                     │
 └──────────┬───────────┘                     │
            │ 1:N                             │ 1:N
            ▼                                 ▼
 ┌─────────────────────────────────────────────────────────┐
 │                       order_items                       │
 ├─────────────────────────────────────────────────────────┤
 │ id (PK)                                                 │
 │ order_id (FK: NC-10001)                                 │
 │ product_id (FK: P-1001)                                 │
 │ quantity (e.g. 2)                                       │
 │ unit_price (e.g. 150000)                                │
 │ subtotal (e.g. 300000)                                  │
 └─────────────────────────────────────────────────────────┘
```

---

## 3. Database Models Implementation (`src/database/models.py`)

```python
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True) # e.g. "CUS-001"
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True) # e.g. "P-1001"
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    specs = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    rating = Column(Float, default=4.5)
    image_url = Column(String, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True) # e.g. "NC-10001"
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="Processing") # "Processing", "Shipped", "Delivered", "Cancelled"
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(String, nullable=False)
    tracking_number = Column(String, nullable=True)
    courier = Column(String, default="TCS Express")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
```

---

## 4. Seed Data Migration Pipeline (`scripts/seed_database.py`)

A migration script ingests existing CSV data into the SQL database on initialization:
* Ingests **16 product models** from `data/products.csv`.
* Ingests **25 historical orders** and customer accounts from `data/orders.csv`.
* Populates mock user accounts with passwords and addresses.

---

## 5. Storefront REST APIs (`app/api/v1/endpoints/store.py`)

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/store/products` | `GET` | Return paginated product catalog with category & price filters |
| `/api/v1/store/products/{id}` | `GET` | Return single product details and real-time inventory count |
| `/api/v1/store/orders` | `POST` | Create a new order, validate inventory, decrement stock, return order ID |
| `/api/v1/store/orders/customer/{id}` | `GET` | Return customer's order history |
| `/api/v1/store/orders/{id}` | `GET` | Return single order tracking details and item lines |
| `/api/v1/store/auth/login` | `POST` | Authenticate customer and return JWT session token |

---

## 6. Phase Checklist

- [ ] Configure database engine (`src/database/session.py`) supporting PostgreSQL & SQLite.
- [ ] Implement SQLAlchemy ORM models in `src/database/models.py`.
- [ ] Create `scripts/seed_database.py` to migrate historical CSV data into the database.
- [ ] Implement Storefront REST endpoints in `app/api/v1/endpoints/store.py`.
- [ ] Write transactional inventory deduction logic on order placement.
- [ ] Add unit tests verifying database CRUD operations and stock decrementing.
