import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.database.session import SessionLocal
from src.database.models import Product, Order, OrderItem, User
from src.schemas.store import OrderCreateRequest, OrderItemCreate
from app.api.v1.endpoints.store import (
    get_products, 
    get_product_detail, 
    check_inventory, 
    place_order, 
    get_customer_orders
)

def test_store_functionality():
    db = SessionLocal()
    try:
        print("--- 1. Testing Product Retrieval ---")
        products = get_products(category=None, brand=None, q=None, max_price=None, in_stock_only=False, db=db)
        print(f"Loaded {len(products)} products from SQL database.")
        assert len(products) > 0, "No products found in database!"

        print("--- 2. Testing Product Detail ---")
        p = get_product_detail(product_id="P-1002", db=db)
        print(f"Product: {p['name']} | Price: PKR {p['price']:,.0f} | Stock: {p['stock']}")
        assert p["id"] == "P-1002"

        print("--- 3. Testing Inventory Check ---")
        inv = check_inventory(product_id="P-1002", db=db)
        print(f"Live Inventory: {inv['stock_count']} units available. (In stock: {inv['in_stock']})")
        initial_stock = inv["stock_count"]

        print("--- 4. Testing Order Placement with Stock Decrement ---")
        order_req = OrderCreateRequest(
            customer_id="CUS-001",
            customer_name="Ali Raza",
            email="ali.raza@example.pk",
            phone="+92 300 1234567",
            shipping_address="House 42-B, Street 9, F-7/2, Islamabad",
            courier="Leopard Express",
            items=[OrderItemCreate(product_id="P-1002", quantity=1)]
        )
        new_order = place_order(payload=order_req, db=db)
        print(f"Created Order: {new_order['id']} | Status: {new_order['status']} | Total: PKR {new_order['total_amount']:,.0f}")
        assert new_order["id"].startswith("NC-")
        assert len(new_order["items"]) == 1

        # Check stock immediately decremented
        inv_after = check_inventory(product_id="P-1002", db=db)
        print(f"Stock after order: {inv_after['stock_count']} (Decremented from {initial_stock})")
        assert inv_after["stock_count"] == initial_stock - 1, "Stock decrement failed!"

        print("--- 5. Testing Customer Order History ---")
        cust_orders = get_customer_orders(customer_id="CUS-001", db=db)
        print(f"Customer CUS-001 has {len(cust_orders)} historical orders.")
        assert len(cust_orders) >= 1

        print("\n==================================================")
        print("ALL PHASE 02 DATABASE & STORE TESTS PASSED 100%!")
        print("==================================================")
    finally:
        db.close()

if __name__ == "__main__":
    test_store_functionality()
