import pytest
from src.tools.order_tool import get_order_status
from src.tools.product_tool import search_products
from src.tools.calculator_tool import calculate
from src.tools.knowledge_tool import search_knowledge_base
from src.tools.escalation_tool import escalate_to_human

def test_order_status_tool_success():
    """Verify order lookup tool successfully retrieves order details."""
    res = get_order_status.invoke({"order_id": "NC-10003"})
    assert "Shipped" in res or "Delivered" in res or "Processing" in res or "Order Details" in res
    assert "TRK-928381" in res

def test_order_status_security_denied():
    """Verify order tool blocks unauthorized customer access."""
    res = get_order_status.invoke({"order_id": "NC-10003", "requesting_customer_id": "WRONG_CUST_999"})
    assert "SECURITY DENIED" in res

def test_product_search_tool():
    """Verify product search tool finds matching laptops and catalog specs."""
    res = search_products.invoke({"query": "NovaGame X16"})
    assert "NovaGame X16" in res
    assert "399,999" in res or "399999" in res

def test_product_search_ram_spec():
    """Verify product search handles RAM spec queries like '32GB RAM'."""
    res = search_products.invoke({"query": "32GB RAM"})
    assert "32GB RAM" in res or "NovaBook Pro 14" in res or "NovaGame X16" in res

def test_calculator_tool():
    """Verify safe calculator evaluates expressions correctly."""
    res = calculate.invoke({"expression": "1200 * (1 - 0.15)"})
    assert "1020" in res

def test_knowledge_base_tool():
    """Verify knowledge base tool retrieves RAG policy context."""
    res = search_knowledge_base.invoke({"query": "return policy days"})
    assert "return_policy.md" in res or "30" in res

def test_escalation_tool():
    """Verify human escalation tool dispatches ticket ID."""
    res = escalate_to_human.invoke({"customer_issue": "Charged twice on order NC-10002", "priority": "HIGH"})
    assert "TICKET-NC" in res
