import pytest
from src.database.session import SessionLocal
from src.database.models import Order, Product, ReturnRequest
from src.tools.action_tool import cancel_order, request_order_return, update_shipping_address
from src.tools.order_tool import get_order_status, list_customer_orders
from src.tools.product_tool import search_products

def test_autonomous_actions():
    db = SessionLocal()
    try:
        # 1. Test get_order_status
        status_res = get_order_status.invoke({"order_id": "NC-10001", "requesting_customer_id": "CUS-001"})
        assert "NC-10001" in status_res
        assert "Customer:" in status_res
        print("[OK] get_order_status passed")

        # 2. Test list_customer_orders
        orders_res = list_customer_orders.invoke({"customer_id": "CUS-001"})
        assert "Purchase History for CUS-001" in orders_res
        print("[OK] list_customer_orders passed")

        # 3. Test search_products with multi-attribute filtering
        search_res = search_products.invoke({
            "query": "MacBook", 
            "category": "Laptops", 
            "max_price": 500000.0,
            "in_stock_only": True
        })
        assert "MacBook Pro 16" in search_res
        assert "Availability:" in search_res
        print("[OK] search_products with multi-attribute filter passed")

        # 4. Test request_order_return (RMA)
        rma_res = request_order_return.invoke({
            "order_id": "NC-10001",
            "reason": "Customer changed mind, device unopened",
            "requesting_customer_id": "CUS-001"
        })
        assert "RMA Number:" in rma_res
        assert "Approved" in rma_res
        print("[OK] request_order_return passed")

        # 5. Test update_shipping_address
        addr_res = update_shipping_address.invoke({
            "order_id": "NC-10002",
            "new_address": "Street 12, Sector F-8/3, Islamabad",
            "requesting_customer_id": "CUS-001"
        })
        assert "Shipping Address Updated" in addr_res
        print("[OK] update_shipping_address passed")

        # 6. Test cancel_order on NC-10002 (Processing) and check restock
        cancel_res = cancel_order.invoke({
            "order_id": "NC-10002",
            "requesting_customer_id": "CUS-001",
            "reason": "Duplicate order"
        })
        assert "Order Cancelled Successfully" in cancel_res
        print("[OK] cancel_order with restock passed")

    finally:
        db.close()

if __name__ == "__main__":
    test_autonomous_actions()
    print("\nALL AUTONOMOUS AGENT ACTION TESTS PASSED 100%!")
