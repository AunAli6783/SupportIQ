import os
import pytest
from pathlib import Path
from src.tools.analytics_tool import get_sales_statistics
from src.tools.ppt_tool import create_sales_presentation
from src.schemas.presentation import Slide, PresentationPlan
from src.agent.builder import create_support_agent
from src.schemas.parser import ResponseParser

def test_sales_statistics_calculation():
    """Verify sales analytics tool calculates precise business metrics."""
    stats = get_sales_statistics.invoke({})
    assert isinstance(stats, dict)
    assert stats.get("total_orders", 0) > 0
    assert stats.get("total_revenue_pkr", 0.0) > 1000000.0
    assert stats.get("total_units_sold", 0) > 0
    assert len(stats.get("category_breakdown", [])) > 0
    assert len(stats.get("monthly_trends", [])) > 0
    assert len(stats.get("top_performing_products", [])) > 0

def test_presentation_pydantic_schema():
    """Verify PresentationPlan Pydantic schema validation."""
    plan = PresentationPlan(
        title="NovaCart Executive Review",
        subtitle="Total Revenue: PKR 5.6M",
        slides=[
            Slide(title="Overview", bullets=["High growth in Q2", "Laptop demand up"], chart_type="pie"),
            Slide(title="Units Sold", bullets=["NovaGame leads volume"], chart_type="column")
        ]
    )
    assert plan.title == "NovaCart Executive Review"
    assert len(plan.slides) == 2
    assert plan.slides[0].chart_type == "pie"

def test_create_sales_presentation_file_generation():
    """Verify create_sales_presentation builds and saves a valid .pptx file with charts."""
    res = create_sales_presentation.invoke({"request": "Generate executive sales presentation"})
    assert isinstance(res, str)
    assert "NovaCart_Sales_Performance_Report.pptx" in res
    assert "Successfully generated" in res
    
    # Assert file exists on disk
    ppt_path = Path(r"D:\SupportIQ\storage\reports\NovaCart_Sales_Performance_Report.pptx")
    assert ppt_path.exists()
    assert ppt_path.stat().st_size > 10000 # Valid PPTX file with embedded charts > 10KB

def test_agent_presentation_routing():
    """Verify agent routes presentation request to create_sales_presentation tool."""
    agent = create_support_agent()
    res = agent.invoke({
        "input": "Create a PowerPoint presentation showing our product sales performance.",
        "chat_history": []
    })
    
    output = res.get("output", "")
    steps = res.get("intermediate_steps", [])
    
    tool_names = [action.tool for action, _ in steps]
    assert "create_sales_presentation" in tool_names or "get_sales_statistics" in tool_names
    
    parsed = ResponseParser.parse_agent_result(output, steps)
    assert parsed.category in ["presentation_generation", "sales_analytics"]
