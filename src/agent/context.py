from src.schemas.response import PageContext

def format_page_context(ctx: PageContext = None) -> str:
    """Format PageContext into structured, natural string for LLM system prompt."""
    if not ctx:
        return "The customer is on the NovaCart homepage with no active product selected."

    lines = []
    if ctx.current_path:
        lines.append(f"- Active Page URL: {ctx.current_path}")
    if ctx.viewing_product_name:
        lines.append(f"- Currently Viewing Product: {ctx.viewing_product_name} (ID: {ctx.viewing_product_id or 'N/A'})")
        if ctx.viewing_product_price:
            lines.append(f"- Product Price: PKR {ctx.viewing_product_price:,.0f}")
    else:
        lines.append("- Currently Viewing: Browsing Catalog / Non-product page")

    lines.append(f"- Shopping Cart Items: {ctx.cart_item_count} item(s)")
    lines.append(f"- Shopping Cart Total: PKR {ctx.cart_total_pkr:,.0f}")

    if ctx.customer_name:
        lines.append(f"- Authenticated Customer: {ctx.customer_name} (Location: {ctx.customer_city or 'Pakistan'})")

    return "\n".join(lines)
