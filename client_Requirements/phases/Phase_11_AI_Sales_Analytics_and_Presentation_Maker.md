# Phase 11: AI Sales Analytics & Presentation Generator

> **Phase Status:** Planned  
> **Prerequisites:** Phase 04 & Phase 06 Completed (Data Tools & Pydantic Structured Outputs functional)  
> **Target Outcome:** End-to-end sales analytics engine and PowerPoint presentation generator producing structured, executive-ready `.pptx` slide decks complete with charts and business insights.

---

## 1. Objective

Empower SupportIQ to process user requests like *"Create a presentation showing our product sales performance"*. The system computes precise sales metrics from historical `orders.csv` and `products.csv` data using a Python analytics engine, generates a structured slide plan via Pydantic, creates charts, and builds a downloadable `.pptx` presentation.

---

## 2. Architecture & Data Flow Pipeline

```
                                USER REQUEST
                   "Create a sales performance presentation"
                                     │
                                     ▼
                                   AGENT
                                     │
                           Presentation Tool
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
  orders.csv / DB                                         products.csv
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     ▼
                          Python Analytics Engine
                    (Computes Revenue, Units, AOV)
                                     │
                                     ▼
                         Structured Metrics Dict
                                     │
                                     ▼
                            LLM (Pydantic Schema)
                             PresentationPlan
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
     Native Charts                                         Slide Text
     (Bar/Pie/Line)                                    (Insights & Bullets)
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                        PPT Builder (python-pptx)
                                     │
                                     ▼
                          Sales_Report.pptx File
```

### Architectural Separation Principle

> ⚠️ **CRITICAL RULE:** Never send thousands of raw database rows directly into the LLM prompt.
> * **Python Analytics Engine:** Handles all mathematical calculations, sums, grouping, and metrics.
> * **LLM Agent:** Receives pre-computed clean statistics dictionary and handles business interpretation, slide narrative, executive insights, and chart recommendations.

---

## 3. Implementation Components

### Step 11.1: Sales Analytics Engine (`src/tools/analytics_tool.py`)

Calculate precise business metrics from `orders.csv` and `products.csv`:

```python
import pandas as pd
from typing import Dict, Any
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger

@tool("get_sales_statistics")
def get_sales_statistics() -> Dict[str, Any]:
    """
    Analyze NovaCart's historical order and product dataset to return structured sales statistics.
    Includes total revenue, units sold per product, category breakdown, and AOV.
    """
    logger.info("Tool Exec: get_sales_statistics()")
    
    orders_path = settings.KNOWLEDGE_BASE_DIR / "data" / "orders.csv"
    products_path = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"
    
    if not orders_path.exists() or not products_path.exists():
        return {"error": "Sales dataset files missing."}

    orders_df = pd.read_csv(orders_path)
    products_df = pd.read_csv(products_path)

    # Merge dataset
    merged = pd.merge(orders_df, products_df, on="product_name", how="left")
    
    total_orders = len(orders_df)
    total_revenue = merged["total_price"].sum()
    total_units = merged["quantity"].sum()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0

    # Sales by Product
    product_sales = merged.groupby("product_name").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum")
    ).reset_index().to_dict(orient="records")

    # Sales by Category
    category_sales = merged.groupby("category").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum")
    ).reset_index().to_dict(orient="records")

    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_units_sold": total_units,
        "average_order_value": round(avg_order_value, 2),
        "product_breakdown": product_sales,
        "category_breakdown": category_sales
    }
```

---

### Step 11.2: Pydantic Presentation Plan Schema (`src/schemas/presentation.py`)

Define strict slide deck structures:

```python
from typing import List, Optional
from pydantic import BaseModel, Field

class Slide(BaseModel):
    title: str = Field(description="Title of the presentation slide")
    bullets: List[str] = Field(description="Executive bullet points and insights")
    chart_type: Optional[str] = Field(
        default=None, 
        description="Suggested chart type: 'bar', 'pie', 'line', or None"
    )

class PresentationPlan(BaseModel):
    title: str = Field(description="Main presentation title")
    subtitle: str = Field(description="Executive subtitle")
    slides: List[Slide] = Field(description="Ordered list of presentation slides")
```

---

### Step 11.3: PPTX Generation Engine (`src/tools/ppt_tool.py`)

Build PowerPoint `.pptx` files using `python-pptx`:

```python
import os
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from langchain_core.tools import tool
from src.schemas.presentation import PresentationPlan
from src.tools.analytics_tool import get_sales_statistics
from src.config.settings import settings
from src.utils.logger import logger

@tool("create_sales_presentation")
def create_sales_presentation(request: str) -> str:
    """
    Generate a formatted PowerPoint (.pptx) sales presentation file based on historical NovaCart data.
    Returns absolute path to the generated presentation file.
    """
    logger.info(f"Tool Exec: create_sales_presentation(request='{request}')")
    
    # 1. Compute clean analytics statistics
    stats = get_sales_statistics.invoke({})
    
    # 2. Build PPTX File
    prs = Presentation()
    
    # Title Slide
    title_slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(title_slide_layout)
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title.text = "NovaCart Sales Performance Analysis"
    subtitle.text = f"Total Revenue: PKR {stats.get('total_revenue', 0):,.2f} | Total Orders: {stats.get('total_orders', 0)}"

    # Metrics Summary Slide
    bullet_slide_layout = prs.slide_layouts[1]
    slide2 = prs.slides.add_slide(bullet_slide_layout)
    shapes = slide2.shapes
    shapes.title.text = "Executive Summary & Revenue Breakdown"
    
    tf = shapes.placeholders[1].text_frame
    tf.text = f"Total Units Sold: {stats.get('total_units_sold', 0)} units"

    for prod in stats.get("product_breakdown", []):
        p = tf.add_paragraph()
        p.text = f"{prod['product_name']}: {prod['units_sold']} units sold (PKR {prod['total_revenue']:,.2f})"

    output_dir = settings.BASE_DIR / "storage" / "reports"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "Sales_Performance_Report.pptx"
    
    prs.save(str(output_path))
    logger.info(f"Successfully generated presentation at {output_path}")
    return f"Presentation generated successfully. Download file path: {output_path}"
```

---

## 4. Verification & Test Plan

Create `tests/test_presentation.py` to verify:

1. **Analytics Calculation:** `get_sales_statistics()` calculates total orders, units sold, and category breakdowns matching `orders.csv`.
2. **Presentation Generation:** `create_sales_presentation()` creates a valid `.pptx` file in `storage/reports/`.
3. **Pydantic Validation:** `PresentationPlan` schema validates generated slide objects.

---

## 5. Phase 11 Checklist

- [ ] Implement `src/tools/analytics_tool.py` computing revenue and product statistics.
- [ ] Implement `src/schemas/presentation.py` defining Pydantic slide schemas.
- [ ] Implement `src/tools/ppt_tool.py` building `.pptx` files with `python-pptx`.
- [ ] Bind tools to `create_support_agent()` in `src/agent/builder.py`.
- [ ] Run `pytest tests/test_presentation.py` to verify end-to-end presentation generation.
