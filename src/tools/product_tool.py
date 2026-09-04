from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from langchain_core.tools import tool
from src.database.session import SessionLocal
from src.database.models import Product
from src.utils.logger import logger

@tool
def search_products(
    query: str, 
    category: Optional[str] = None, 
    max_price: Optional[float] = None, 
    in_stock_only: bool = False
) -> str:
    """
    Search NovaCart product catalog for items matching keywords, budget limit, category, or specifications.
    
    Args:
        query: Search keywords (e.g., 'MacBook Pro 16', 'Galaxy S25 Ultra', 'Dell XPS', '32GB RAM', 'Sony WH-1000XM5', 'gaming').
        category: Optional category filter ('Laptops', 'Smartphones', 'Audio & Wearables', 'Tablets & Displays', 'Accessories').
        max_price: Optional maximum budget in PKR (e.g., 350000).
        in_stock_only: Set to true if the customer only wants items currently available in inventory.
    """
    logger.info(f"Tool Exec: search_products(query='{query}', category='{category}', max_price={max_price}, in_stock={in_stock_only})")
    db: Session = SessionLocal()
    try:
        db_query = db.query(Product)
        
        if category and category.strip():
            db_query = db_query.filter(Product.category.ilike(f"%{category.strip()}%"))
            
        if max_price and max_price > 0:
            db_query = db_query.filter(Product.price <= max_price)
            
        if in_stock_only:
            db_query = db_query.filter(Product.stock > 0)

        q_clean = query.strip().lower()
        
        # Normalize common plurals
        words = q_clean.split()
        normalized_words = []
        for w in words:
            if w.endswith("s") and len(w) > 3 and not w.endswith("ss"):
                normalized_words.append(w[:-1])
            else:
                normalized_words.append(w)
        
        # 1. Try exact or multi-word pattern
        search_pattern = f"%{q_clean}%"
        matches = db_query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.brand.ilike(search_pattern),
                Product.category.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.tagline.ilike(search_pattern),
                Product.id.ilike(search_pattern)
            )
        ).limit(6).all()

        # 2. If no exact match, search using normalized keywords
        if not matches and normalized_words:
            keyword_filters = []
            for kw in normalized_words:
                if len(kw) >= 2:
                    kw_pattern = f"%{kw}%"
                    keyword_filters.append(
                        or_(
                            Product.name.ilike(kw_pattern),
                            Product.brand.ilike(kw_pattern),
                            Product.category.ilike(kw_pattern),
                            Product.description.ilike(kw_pattern),
                            Product.tagline.ilike(kw_pattern)
                        )
                    )
            if keyword_filters:
                matches = db_query.filter(or_(*keyword_filters)).limit(6).all()

        if not matches:
            filters_applied = []
            if category: filters_applied.append(f"Category='{category}'")
            if max_price: filters_applied.append(f"Budget <= PKR {max_price:,.0f}")
            if in_stock_only: filters_applied.append("In-Stock Only")
            filter_str = f" with filters ({', '.join(filters_applied)})" if filters_applied else ""
            return f"No products matching '{query}'{filter_str} were found in the NovaCart catalog."

        results = []
        for p in matches:
            specs_summary = []
            if p.specs:
                for key in ["processor", "ram", "storage", "display", "battery", "warranty"]:
                    if p.specs.get(key):
                        specs_summary.append(f"{key.capitalize()}: {p.specs[key]}")
            specs_str = " | ".join(specs_summary) if specs_summary else "Standard Hardware Specifications"

            stock_status = f"{p.stock} units in stock" if p.stock > 0 else "Out of Stock (Pre-order only)"
            discount_str = f" ({p.discount_percent}% OFF - Regular: PKR {p.original_price:,.0f})" if p.discount_percent > 0 else ""

            results.append(
                f"• Product: {p.name} (SKU: {p.id})\n"
                f"  - Brand: {p.brand} | Category: {p.category}\n"
                f"  - Current Price: PKR {p.price:,.0f}{discount_str}\n"
                f"  - Availability: {stock_status}\n"
                f"  - Rating: {p.rating} / 5.0 ({p.reviews_count} verified customer reviews)\n"
                f"  - Specifications: {specs_str}"
            )

        return "\n\n".join(results)
    except Exception as e:
        logger.error(f"Error in search_products: {e}")
        return f"Product Catalog Error: {str(e)}"
    finally:
        db.close()
