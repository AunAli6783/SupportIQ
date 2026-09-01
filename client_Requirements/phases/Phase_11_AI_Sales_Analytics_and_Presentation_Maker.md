# Phase 11: AI Sales Analytics & Presentation Generator (Native PowerPoint Charts & Topic Deep Dives)

> **Phase Status:** Completed (100% Verified)  
> **Prerequisites:** Phase 04 & Phase 06 Completed (Data Tools & Pydantic Structured Outputs functional)  
> **Target Outcome:** End-to-end sales analytics engine and PowerPoint presentation generator producing 16:9 widescreen, executive-grade `.pptx` slide decks complete with native Microsoft Office charts (Pie & Clustered Column), visual KPI scorecards, high-contrast typography, and topic/product-specific deep dive slides.

---

## 1. Objective

Empower SupportIQ to process user requests like:
* *"Create a PowerPoint presentation showing our product sales performance."*
* *"Make a presentation specifically for the sales of our NovaBook Pro 14."*
* *"Create slides analyzing all laptop sales."*

The system computes precise sales metrics from historical `orders.csv` and `products.csv` using a Python analytics engine (Pandas), generates structured slide plans, embeds native editable PowerPoint charts, and provides instant browser downloads.

---

## 2. Architecture & Data Flow Pipeline

```
                                USER REQUEST
         "Create presentation for NovaBook Pro 14" or "Global Sales"
                                      │
                                      ▼
                                    AGENT
                                      │
                         create_sales_presentation
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
   orders.csv (25 orders)                                  products.csv (16 models)
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                      ▼
                           Python Analytics Engine
                   (Revenue, Units, AOV, Product Filtering)
                                      │
                                      ▼
                        Targeted Structured Analytics
                                      │
                                      ▼
                         PPT Builder (python-pptx)
                        • 16:9 Widescreen Canvas (13.333" x 7.5")
                        • Executive Dark Palette (#0B0F19)
                        • Visual KPI Scorecards
                        • High-Contrast White Chart Fonts
                        • Native Pie & Column Charts
                                      │
                                      ▼
                       NovaCart_Report.pptx File
                                      │
                                      ▼
                        FastAPI Download Endpoint
                     (GET /api/v1/reports/download/{filename})
                                      │
                                      ▼
                      Next.js Instant Download Button
```

### Architectural Separation Principle

> ⚠️ **CRITICAL RULE:** Never send thousands of raw database rows directly into the LLM prompt.
> * **Python Analytics Engine:** Handles all mathematical calculations, sums, grouping, and metrics in Python/Pandas.
> * **Native Charts:** Charts are embedded as real Microsoft Office XML objects (`CategoryChartData`), ensuring they are interactive, responsive, and editable in Microsoft PowerPoint.

---

## 3. Implementation Components

### Step 11.1: Sales Analytics Engine (`src/tools/analytics_tool.py`)

Computes precise business metrics with optional product/category filtering:

```python
@tool("get_sales_statistics")
def get_sales_statistics(filter_category: str = "", filter_product: str = "") -> Dict[str, Any]:
    """
    Analyze NovaCart's historical orders and product catalog dataset.
    Can be filtered by category (e.g. 'Laptop') or specific product name (e.g. 'NovaBook Pro 14').
    Computes total revenue, units sold, category breakdown, monthly trends, and AOV.
    """
```

---

### Step 11.2: Topic-Aware PowerPoint Generator (`src/tools/ppt_tool.py`)

Builds 16:9 widescreen executive slide decks with native charts:

* **Slide 1:** Executive Cover & 4 Visual KPI Scorecards (Revenue, Volume, Share %, Unit Price).
* **Slide 2:** Hardware Specifications & Catalog Positioning Scorecards.
* **Slide 3:** 2026 Monthly Sales Trajectory (Native Clustered Column Chart).
* **Slide 4:** Category Peer Comparison & Benchmarking (Native Clustered Column Chart).
* **Slide 5:** Order Delivery & Fulfillment Breakdown (Native Pie Chart).
* **Slide 6:** Strategic Growth Action Matrix (3 Visual Strategy Cards).

```python
def _style_chart(chart, is_pie: bool = False):
    """Format all chart data labels, axis text, and legends with high-contrast white styling."""
    if chart.has_legend:
        chart.legend.font.color.rgb = RGBColor(241, 245, 249)
        chart.legend.font.size = Pt(10)
        chart.legend.font.bold = True

    if chart.plots:
        plot = chart.plots[0]
        plot.has_data_labels = True
        data_labels = plot.data_labels
        data_labels.font.color.rgb = RGBColor(255, 255, 255)
        data_labels.font.size = Pt(10)
        data_labels.font.bold = True
```

---

### Step 11.3: API Download Route & Frontend Download Action

* **FastAPI Backend (`app/api/v1/endpoints/chat.py`):**
  ```python
  @router.get("/reports/download/{filename}")
  async def download_report(filename: str):
      file_path = settings.BASE_DIR / "storage" / "reports" / filename
      return FileResponse(path=file_path, filename=filename, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
  ```
* **Next.js React Frontend (`frontend/app/page.tsx`):**
  Renders an instant **"📥 Download PowerPoint (.pptx)"** action button that triggers automatic browser download.

---

## 4. Verification & Test Plan

Automated test suite in `tests/test_presentation.py` verifies:

1. **Analytics Calculation:** `get_sales_statistics()` calculates total orders, units sold, and category breakdowns.
2. **File Generation:** `create_sales_presentation()` creates a valid `.pptx` file (>10KB) with embedded charts.
3. **Pydantic Validation:** `PresentationPlan` schema validates generated slide objects.
4. **Agent Tool Routing:** Prompts to create presentations invoke `create_sales_presentation`.

---

## 5. Phase 11 Completion Status

- [x] Implemented `src/tools/analytics_tool.py` supporting global and model-specific calculations.
- [x] Implemented `src/schemas/presentation.py` defining Pydantic slide schemas.
- [x] Implemented `src/tools/ppt_tool.py` with 16:9 widescreen layout, dark theme, and native charts.
- [x] Added high-contrast pure white styling for all chart numbers, legends, and axis text.
- [x] Added `GET /api/v1/reports/download/{filename}` FastAPI download endpoint.
- [x] Bound tools to `create_support_agent()` in `src/agent/builder.py`.
- [x] Executed `pytest tests/test_presentation.py` with 100% pass rate.
