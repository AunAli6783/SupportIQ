import pandas as pd
from typing import Optional
from langchain_core.tools import tool
from src.config.settings import settings
from src.utils.logger import logger

PRODUCTS_CSV_PATH = settings.KNOWLEDGE_BASE_DIR / "data" / "products.csv"

@tool
def search_products(query: str, category: Optional[str] = None) -> str:
    """
    Search NovaCart product catalog for items matching a keyword, RAM specification, or category.
    
    Args:
        query: Search keywords (e.g., 'gaming laptop 32GB RAM', 'NovaBook Air', 'NovaCharge', '32GB').
        category: Optional category filter ('Laptop', 'Smartphone', 'Accessory').
    """
    logger.info(f"Tool Exec: search_products(query='{query}', category='{category}')")
    
    if not PRODUCTS_CSV_PATH.exists():
        return "Product System Error: Catalog database is unavailable."

    df = pd.read_csv(PRODUCTS_CSV_PATH)
    query_lower = query.lower()
    
    # Filter by category if provided
    if category and str(category).strip() != "":
        df = df[df["category"].str.lower() == category.lower().strip()]

    # Convert numeric RAM/Storage columns to text string for searching (e.g. "32", "512", "1024")
    df["ram_str"] = df["ram_gb"].fillna("").astype(str).str.replace(".0", "", regex=False)
    df["storage_str"] = df["storage_gb"].fillna("").astype(str).str.replace(".0", "", regex=False)

    # Case-insensitive keyword matching across product name, sku, category, ram, storage
    matches = df[
        df["name"].str.lower().str.contains(query_lower, na=False) |
        df["sku"].str.lower().str.contains(query_lower, na=False) |
        df["category"].str.lower().str.contains(query_lower, na=False) |
        df["ram_str"].str.lower().str.contains(query_lower, na=False) |
        df["storage_str"].str.lower().str.contains(query_lower, na=False)
    ]

    # Special handling for specs queries like "32GB RAM" or "32 GB"
    if matches.empty and ("gb" in query_lower or "ram" in query_lower):
        import re
        nums = re.findall(r"\d+", query_lower)
        if nums:
            target_num = nums[0]
            matches = df[df["ram_str"] == target_num]

    if matches.empty:
        return f"No products matching '{query}' were found in the NovaCart catalog."

    results = []
    for _, row in matches.iterrows():
        ram_info = f"{int(row['ram_gb'])}GB RAM" if pd.notna(row.get('ram_gb')) else "N/A"
        storage_info = f"{int(row['storage_gb'])}GB Storage" if pd.notna(row.get('storage_gb')) else "N/A"
        
        results.append(
            f"• Product: {row['name']} (SKU: {row.get('sku', 'N/A')})\n"
            f"  - Category: {row.get('category', 'N/A')}\n"
            f"  - Price: PKR {row.get('price_pkr', 'N/A'):,}\n"
            f"  - Stock Availability: {row.get('stock', 0)} units in stock\n"
            f"  - Specifications: {ram_info} | {storage_info}"
        )

    return "\n\n".join(results)
