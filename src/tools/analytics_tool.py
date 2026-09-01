import pandas as pd
from typing import Dict, Any, List
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger

@tool("get_sales_statistics")
def get_sales_statistics(filter_category: str = "", filter_product: str = "") -> Dict[str, Any]:
    """
    Analyze NovaCart's historical orders and product catalog dataset to return structured sales statistics.
    Can be filtered by category (e.g. 'Laptop', 'Smartphone') or specific product name (e.g. 'NovaBook Pro 14').
    Computes total revenue, units sold, category breakdown, monthly trends, top products, and average order value.
    """
    logger.info(f"Tool Exec: get_sales_statistics(filter_category='{filter_category}', filter_product='{filter_product}')")
    
    orders_path = settings.KNOWLEDGE_BASE_DIR / "data" / "orders.csv"
    products_path = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"
    
    if not orders_path.exists() or not products_path.exists():
        logger.error(f"Orders or products dataset missing at {orders_path}")
        return {"error": "Sales dataset files missing."}

    orders_df = pd.read_csv(orders_path)
    products_df = pd.read_csv(products_path)

    # Merge on product_sku
    merged = pd.merge(orders_df, products_df, left_on="product_sku", right_on="sku", how="left", suffixes=("", "_prod"))
    
    if "category" in merged.columns:
        merged["category"] = merged["category"].fillna("General")

    # Global catalog totals for benchmark
    global_completed = orders_df[orders_df["status"] != "Cancelled"]
    global_total_revenue = float(global_completed["total_price"].sum())
    global_total_units = int(global_completed["quantity"].sum())

    # Optional filtering
    filtered_df = merged.copy()
    if filter_category:
        filtered_df = filtered_df[filtered_df["category"].str.lower().str.contains(filter_category.lower())]

    if filter_product:
        filtered_df = filtered_df[filtered_df["product_name"].str.lower().str.contains(filter_product.lower())]

    completed = filtered_df[filtered_df["status"] != "Cancelled"]
    total_orders = len(filtered_df)
    completed_orders = len(completed)
    cancelled_orders = len(filtered_df[filtered_df["status"] == "Cancelled"])
    
    total_revenue = float(completed["total_price"].sum()) if completed_orders > 0 else 0.0
    total_units = int(completed["quantity"].sum()) if completed_orders > 0 else 0
    avg_order_value = float(total_revenue / completed_orders if completed_orders > 0 else 0.0)

    # Product Breakdown
    prod_grp = completed.groupby("product_name").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum"),
        category=("category", "first"),
        price=("price_pkr", "first"),
        rating=("rating", "first"),
        warranty=("warranty_months", "first")
    ).reset_index().sort_values(by="total_revenue", ascending=False)
    product_breakdown = prod_grp.to_dict(orient="records")

    # Category Breakdown
    cat_grp = merged[merged["status"] != "Cancelled"].groupby("category").agg(
        units_sold=("quantity", "sum"),
        total_revenue=("total_price", "sum")
    ).reset_index().sort_values(by="total_revenue", ascending=False)
    category_breakdown = cat_grp.to_dict(orient="records")

    # Monthly Trends (extract YYYY-MM from order_date)
    filtered_df["month"] = pd.to_datetime(filtered_df["order_date"]).dt.strftime("%Y-%m")
    month_grp = filtered_df[filtered_df["status"] != "Cancelled"].groupby("month").agg(
        revenue=("total_price", "sum"),
        units=("quantity", "sum"),
        orders_count=("order_id", "count")
    ).reset_index().sort_values(by="month")
    monthly_trends = month_grp.to_dict(orient="records")

    top_products = [p["product_name"] for p in product_breakdown[:3]]
    underperforming = [p["product_name"] for p in product_breakdown[-3:]]

    # Target product info if single product requested
    target_product_info = None
    if filter_product and len(product_breakdown) > 0:
        target_product_info = product_breakdown[0]
        # Also compute category comparison
        cat_name = target_product_info.get("category", "")
        cat_siblings = merged[(merged["status"] != "Cancelled") & (merged["category"] == cat_name)].groupby("product_name").agg(
            units_sold=("quantity", "sum"),
            total_revenue=("total_price", "sum")
        ).reset_index().to_dict(orient="records")
        target_product_info["category_peers"] = cat_siblings

    return {
        "is_filtered": bool(filter_category or filter_product),
        "filter_category": filter_category,
        "filter_product": filter_product,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "total_revenue_pkr": round(total_revenue, 2),
        "total_units_sold": total_units,
        "average_order_value_pkr": round(avg_order_value, 2),
        "global_total_revenue_pkr": round(global_total_revenue, 2),
        "global_total_units": global_total_units,
        "revenue_share_percent": round((total_revenue / global_total_revenue * 100) if global_total_revenue > 0 else 0.0, 1),
        "top_performing_products": top_products,
        "underperforming_products": underperforming,
        "category_breakdown": category_breakdown,
        "product_breakdown": product_breakdown,
        "monthly_trends": monthly_trends,
        "target_product_info": target_product_info
    }
