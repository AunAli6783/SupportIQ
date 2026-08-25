from pathlib import Path
from typing import Dict, Any

CATEGORY_MAP = {
    "policies": "policy",
    "company": "company_info",
    "faq": "faq",
    "products": "product_manual"
}

DEPARTMENT_MAP = {
    "return_policy.md": "customer_support",
    "refund_policy.md": "finance",
    "shipping_policy.md": "logistics",
    "warranty_policy.md": "technical_support",
    "payment_policy.md": "finance",
    "cancellation_policy.md": "customer_support",
    "privacy_policy.md": "legal",
    "terms_conditions.md": "legal",
    "customer_faq.md": "general_support",
    "laptops.md": "product_catalog",
    "smartphones.md": "product_catalog",
    "accessories.md": "product_catalog"
}

def extract_file_metadata(file_path: Path) -> Dict[str, Any]:
    """
    Extract structured metadata attributes based on file location, directory parent, and file name.
    """
    relative_parent = file_path.parent.name
    file_name = file_path.name
    
    return {
        "source": file_name,
        "relative_path": str(file_path),
        "category": CATEGORY_MAP.get(relative_parent, "general"),
        "department": DEPARTMENT_MAP.get(file_name, "customer_support"),
        "document_type": "markdown"
    }
