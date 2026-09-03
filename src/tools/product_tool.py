from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from langchain_core.tools import tool
from src.database.session import SessionLocal
from src.database.models import Product
from src.utils.logger import logger

@tool
def search_products(query: str, category: Optional[str] = None) -> str:
    """
    Search NovaCart product catalog for items matching a keyword, RAM specification, or category from live database.
    
    Args:
        query: Search keywords (e.g., 'MacBook Pro 16', 'Galaxy S25 Ultra', 'Dell XPS', '32GB RAM', 'Sony WH-1000XM5').
        category: Optional category filter ('Laptops', 'Smartphones', 'Audio & Wearables', 'Tablets & Displays').
    """
    logger.info(f"Tool Exec: search_products(query='{query}', category='{category}')")
    db: Session = SessionLocal()
    try:
        db_query = db.query(Product)
        if category and category.strip():
            db_query = db_query.filter(Product.category.ilike(f"%{category.strip()}%"))

        q_clean = query.strip()
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

        if not matches:
            return f"No products matching '{query}' were found in the NovaCart catalog."

        results = []
        for p in matches:
            specs_summary = []
            if p.specs:
                if p.specs.get("processor"):
                    specs_summary.append(f"Processor: {p.specs['processor']}")
                if p.specs.get("ram"):
                    specs_summary.append(f"RAM: {p.specs['ram']}")
                if p.specs.get("storage"):
                    specs_summary.append(f"Storage: {p.specs['storage']}")
                if p.specs.get("warranty"):
                    specs_summary.append(f"Warranty: {p.specs['warranty']}")
            specs_str = " | ".join(specs_summary) if specs_summary else "Standard Hardware"

            results.append(
                f"• Product: {p.name} (SKU: {p.id})\n"
                f"  - Brand: {p.brand} | Category: {p.category}\n"
                f"  - Price: PKR {p.price:,.0f} (Discount: {p.discount_percent}% OFF)\n"
                f"  - Live Stock: {p.stock} units available\n"
                f"  - Rating: {p.rating} / 5.0 ({p.reviews_count} reviews)\n"
                f"  - Specifications: {specs_str}"
            )

        return "\n\n".join(results)
    except Exception as e:
        logger.error(f"Error in search_products: {e}")
        return f"Product Catalog Error: {str(e)}"
    finally:
        db.close()
