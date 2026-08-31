import pandas as pd
from typing import Dict, Any, List
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger

@tool("get_sales_statistics")
def get_sales_statistics(filter_category: str = "") -> Dict[str, Any]:
    """
    Analyze NovaCart's historical orders and product catalog dataset to return structured sales statistics.
    Computes total revenue, units sold, category breakdown, monthly trends, top products, and average order value.
    """
    logger.info(f"Tool Exec: get_sales_statistics(filter_category='{filter_category}')")
    
    orders_path = settings.KNOWLEDGE_BASE_DIR / "data" / "orders.csv"
    products_path = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"
    
    if not orders_path.exists() or not products_path.exists():
        logger.error(f"Orders or products dataset missing at {orders_path}")
        return {"error": "Sales dataset files missing."}

    orders_df = pd.read_csv(orders_path)
    products_df = pd.read_csv(products_path)

    # Merge on product_name or product_sku
    merged = pd.merge(orders_df, products_df, left_on="product_sku", right_on="sku", how="left", suffixes=("", "_prod"))
    
    # Fill missing category if any
    if "category" in merged.columns:
        merged["category"] = merged["category"].fillna("General")

    if filter_category:
        merged = merged[merged["category"].str.lower() == filter_category.lower()]

    total_orders = len(orders_df)
    completed_orders = len(orders_df[orders_df["status"] != "Cancelled"])
    cancelled_orders = len(orders_df[orders_df["status"] == "Cancelled"])
    
    total_revenue = float(orders_df[orders_df["status"] != "Cancelled"]["total_price"].sum())
    total_units = int(orders_df[orders_df["status"] != "Cancelled"]["quantity"].sum())
    avg_order_value = float(total_revenue / completed_orders if completed_orders > 0 else 0.0)

    # Product Breakdown
    prod_grp = merged[merged["status"] != "Cancelled"].groupby("product_name").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum"),
        category=("category", "first")
    ).reset_index()
    
    prod_grp = prod_grp.sort_values(by="total_revenue", ascending=False)
    product_breakdown = prod_grp.to_dict(orient="records")

    # Category Breakdown
    cat_grp = merged[merged["status"] != "Cancelled"].groupby("category").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum")
    ).reset_index()
    
    cat_grp = cat_grp.sort_values(by="total_revenue", ascending=False)
    category_breakdown = cat_grp.to_dict(orient="records")

    # Monthly Trends (extract YYYY-MM from order_date)
    orders_df["month"] = pd.to_datetime(orders_df["order_date"]).dt.strftime("%Y-%m")
    month_grp = orders_df[orders_df["status"] != "Cancelled"].groupby("month").agg(
        revenue=("total_price", "sum"),
        units=("quantity", "sum"),
        orders_count=("order_id", "count")
    ).reset_index().sort_values(by="month")
    
    monthly_trends = month_grp.to_dict(orient="records")

    top_products = [p["product_name"] for p in product_breakdown[:3]]
    underperforming = [p["product_name"] for p in product_breakdown[-3:]]

    return {
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "total_revenue_pkr": round(total_revenue, 2),
        "total_units_sold": total_units,
        "average_order_value_pkr": round(avg_order_value, 2),
        "top_performing_products": top_products,
        "underperforming_products": underperforming,
        "category_breakdown": category_breakdown,
        "product_breakdown": product_breakdown,
        "monthly_trends": monthly_trends
    }
