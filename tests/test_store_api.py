import asyncio
import httpx
from app.main import app

async def run():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health check
        h = await client.get("/health")
        print("Health check:", h.status_code, h.json())

        # 2. Get products
        prods = await client.get("/api/v1/store/products")
        print(f"Products count: {len(prods.json())} (Status: {prods.status_code})")

        # 3. Product detail & inventory
        p = await client.get("/api/v1/store/products/P-1002")
        print("Product P-1002:", p.json()["name"], "Stock:", p.json()["stock"])

        inv = await client.get("/api/v1/store/inventory/P-1002")
        print("Inventory P-1002:", inv.json())

        # 4. Place Order and verify stock decrement
        initial_stock = inv.json()["stock_count"]
        payload = {
            "customer_id": "CUS-001",
            "customer_name": "Ali Raza",
            "email": "ali.raza@example.pk",
            "phone": "+92 300 1234567",
            "shipping_address": "House 42-B, Street 9, F-7/2, Islamabad",
            "courier": "Leopard Express",
            "items": [{"product_id": "P-1002", "quantity": 1}]
        }
        order_res = await client.post("/api/v1/store/orders", json=payload)
        print("Placed Order:", order_res.status_code, order_res.json()["id"], "Total:", order_res.json()["total_amount"])

        inv_after = await client.get("/api/v1/store/inventory/P-1002")
        print("Stock after order:", inv_after.json()["stock_count"], "(Was:", initial_stock, ")")
        assert inv_after.json()["stock_count"] == initial_stock - 1, "Stock decrement verification failed!"

        # 5. Customer orders
        orders = await client.get("/api/v1/store/orders/customer/CUS-001")
        print("Customer CUS-001 Orders:", len(orders.json()))

        print("\nALL PHASE 02 TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(run())
