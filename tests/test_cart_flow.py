import json
import pytest
import httpx
from sqlalchemy.orm import Session
from src.database.session import SessionLocal, init_db
from src.database.models import User, Product, CartItem
from src.tools.cart_tool import add_to_cart, get_customer_cart, remove_from_cart
from app.main import app

init_db()

def test_database_cart_model():
    """Verify CartItem model direct CRUD in SQLite."""
    db: Session = SessionLocal()
    test_cust_id = "TEST-CUS-999"
    test_prod_id = "P-1002"

    try:
        db.query(CartItem).filter(CartItem.customer_id == test_cust_id).delete()
        user = db.query(User).filter(User.id == test_cust_id).first()
        if not user:
            user = User(
                id=test_cust_id,
                name="Test Buyer",
                email="test.buyer@novacart.pk",
                phone="+92 300 9999999",
                city="Islamabad"
            )
            db.add(user)
            db.commit()

        item = CartItem(customer_id=test_cust_id, product_id=test_prod_id, quantity=2)
        db.add(item)
        db.commit()
        db.refresh(item)

        assert item.id is not None
        assert item.quantity == 2
        assert item.product_id == test_prod_id

        found = db.query(CartItem).filter(
            CartItem.customer_id == test_cust_id,
            CartItem.product_id == test_prod_id
        ).first()
        assert found is not None
        assert found.quantity == 2
        item_dict = found.to_dict()
        assert item_dict["customer_id"] == test_cust_id
        assert item_dict["quantity"] == 2

        found.quantity = 4
        db.commit()
        db.refresh(found)
        assert found.quantity == 4

        db.delete(found)
        db.commit()
        check_del = db.query(CartItem).filter(
            CartItem.customer_id == test_cust_id,
            CartItem.product_id == test_prod_id
        ).first()
        assert check_del is None

    finally:
        db.query(CartItem).filter(CartItem.customer_id == test_cust_id).delete()
        db.query(User).filter(User.id == test_cust_id).delete()
        db.commit()
        db.close()


def test_cart_tools_execution():
    """Verify add_to_cart, get_customer_cart, and remove_from_cart tools."""
    test_cust_id = "TEST-TOOL-CUS"
    db: Session = SessionLocal()

    try:
        db.query(CartItem).filter(CartItem.customer_id == test_cust_id).delete()
        db.commit()

        add_res = add_to_cart.invoke({
            "product_id_or_name": "Samsung Galaxy S26 Ultra",
            "customer_id": test_cust_id,
            "quantity": 2
        })
        assert "CART_ACTION_SUCCESS:" in add_res
        payload = json.loads(add_res.split("CART_ACTION_SUCCESS:")[1].strip())
        assert payload["status"] == "success"
        assert payload["action"] == "add_to_cart"
        assert payload["customer_id"] == test_cust_id
        assert payload["quantity"] == 2

        db_item = db.query(CartItem).filter(CartItem.customer_id == test_cust_id).first()
        assert db_item is not None
        assert db_item.quantity == 2

        add_more = add_to_cart.invoke({
            "product_id_or_name": "Samsung Galaxy S26 Ultra",
            "customer_id": test_cust_id,
            "quantity": 1
        })
        assert "CART_ACTION_SUCCESS:" in add_more
        db.expire_all()
        db_item_updated = db.query(CartItem).filter(CartItem.customer_id == test_cust_id).first()
        assert db_item_updated.quantity == 3

        cart_view = get_customer_cart.invoke({"customer_id": test_cust_id})
        assert "Current Shopping Cart" in cart_view
        assert "Samsung Galaxy S26 Ultra" in cart_view
        assert "Qty: 3" in cart_view

        rem_res = remove_from_cart.invoke({
            "product_id_or_name": "Samsung Galaxy S26 Ultra",
            "customer_id": test_cust_id
        })
        assert "CART_ACTION_SUCCESS:" in rem_res
        db.expire_all()
        db_item_deleted = db.query(CartItem).filter(CartItem.customer_id == test_cust_id).first()
        assert db_item_deleted is None

    finally:
        db.query(CartItem).filter(CartItem.customer_id == test_cust_id).delete()
        db.query(User).filter(User.id == test_cust_id).delete()
        db.commit()
        db.close()


@pytest.mark.asyncio
async def test_cart_rest_endpoints():
    """Verify FastAPI /api/v1/store/cart REST endpoints."""
    test_cust_id = "TEST-API-CUS"
    test_prod_id = "P-1002"

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        await client.delete(f"/api/v1/store/cart/{test_cust_id}")

        res = await client.get(f"/api/v1/store/cart/{test_cust_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["customer_id"] == test_cust_id
        assert data["item_count"] == 0
        assert data["items"] == []

        add_res = await client.post("/api/v1/store/cart", json={
            "customer_id": test_cust_id,
            "product_id": test_prod_id,
            "quantity": 1
        })
        assert add_res.status_code == 200
        add_data = add_res.json()
        assert add_data["item_count"] == 1
        assert len(add_data["items"]) == 1
        assert add_data["items"][0]["product_id"] == test_prod_id

        add_res2 = await client.post("/api/v1/store/cart", json={
            "customer_id": test_cust_id,
            "product_id": test_prod_id,
            "quantity": 2
        })
        assert add_res2.status_code == 200
        assert add_res2.json()["item_count"] == 3

        del_item = await client.delete(f"/api/v1/store/cart/{test_cust_id}/{test_prod_id}")
        assert del_item.status_code == 200
        assert del_item.json()["item_count"] == 0

        clear_res = await client.delete(f"/api/v1/store/cart/{test_cust_id}")
        assert clear_res.status_code == 200
