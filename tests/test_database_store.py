import unittest
from fastapi.testclient import TestClient
from app.main import app
from src.database.session import SessionLocal
from src.database.models import Product, Order, User

class TestDatabaseAndStoreEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("database", data)

    def test_02_get_store_products(self):
        response = self.client.get("/api/v1/store/products")
        self.assertEqual(response.status_code, 200)
        products = response.json()
        self.assertTrue(len(products) > 0)
        self.assertTrue(any(p["id"] == "P-1002" for p in products))

    def test_03_product_detail_and_inventory(self):
        response = self.client.get("/api/v1/store/products/P-1002")
        self.assertEqual(response.status_code, 200)
        product = response.json()
        self.assertEqual(product["id"], "P-1002")
        self.assertTrue(product["stock"] > 0)

        inv_response = self.client.get("/api/v1/store/inventory/P-1002")
        self.assertEqual(inv_response.status_code, 200)
        inv = inv_response.json()
        self.assertTrue(inv["in_stock"])
        self.assertEqual(inv["stock_count"], product["stock"])

    def test_04_place_order_and_decrement_stock(self):
        # 1. Get initial stock
        inv_before = self.client.get("/api/v1/store/inventory/P-1008").json()
        initial_stock = inv_before["stock_count"]
        self.assertGreaterEqual(initial_stock, 1)

        # 2. Place Order
        payload = {
            "customer_id": "CUS-001",
            "customer_name": "Ali Raza",
            "email": "ali.raza@example.pk",
            "phone": "+92 300 1234567",
            "shipping_address": "House 42-B, Street 9, F-7/2, Islamabad",
            "courier": "Leopard Express",
            "items": [
                {
                    "product_id": "P-1008",
                    "quantity": 1
                }
            ]
        }
        order_res = self.client.post("/api/v1/store/orders", json=payload)
        self.assertEqual(order_res.status_code, 201)
        order_data = order_res.json()
        self.assertTrue(order_data["id"].startswith("NC-"))
        self.assertEqual(order_data["customer_id"], "CUS-001")
        self.assertEqual(order_data["status"], "Processing")
        self.assertEqual(len(order_data["items"]), 1)

        # 3. Verify stock decremented by exactly 1
        inv_after = self.client.get("/api/v1/store/inventory/P-1008").json()
        self.assertEqual(inv_after["stock_count"], initial_stock - 1)

    def test_05_get_customer_orders(self):
        response = self.client.get("/api/v1/store/orders/customer/CUS-001")
        self.assertEqual(response.status_code, 200)
        orders = response.json()
        self.assertGreaterEqual(len(orders), 1)
        self.assertTrue(all(o["customer_id"] == "CUS-001" for o in orders))

if __name__ == "__main__":
    unittest.main()
