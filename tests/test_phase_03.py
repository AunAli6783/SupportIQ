import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.schemas.response import PageContext
from src.agent.context import format_page_context
from src.tools.inventory_tool import check_inventory
from src.tools.product_tool import search_products

def test_phase_03():
    print("--- 1. Testing Page Context Formatting ---")
    ctx = PageContext(
        current_path="/products/P-1001",
        viewing_product_id="P-1001",
        viewing_product_name="Apple MacBook Pro 16 (M3 Max)",
        viewing_product_price=485000.0,
        cart_item_count=2,
        cart_total_pkr=880000.0,
        customer_name="Ali Raza",
        customer_city="Islamabad"
    )
    formatted = format_page_context(ctx)
    print("Formatted Page Context:\n", formatted)
    assert "Apple MacBook Pro 16" in formatted
    assert "Ali Raza" in formatted
    assert "880,000" in formatted

    print("\n--- 2. Testing Live Inventory Tool for Active Product ---")
    inv_res = check_inventory.invoke({"product_name_or_id": "P-1001"})
    print("Inventory result:\n", inv_res)
    assert "IN STOCK" in inv_res
    assert "MacBook Pro 16" in inv_res

    print("\n--- 3. Testing Product Catalog Search Tool ---")
    search_res = search_products.invoke({"query": "Galaxy S25 Ultra"})
    print("Search result:\n", search_res)
    assert "Samsung Galaxy S25" in search_res
    assert "PKR 395,000" in search_res

    print("\n==================================================")
    print("ALL PHASE 03 CONTEXT BRIDGE TESTS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    test_phase_03()
