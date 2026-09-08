from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    source: str = Field(description="Filename of source document (e.g. 'return_policy.md')")
    category: Optional[str] = Field(default="general", description="Document policy category")
    department: Optional[str] = Field(default="customer_support", description="Owner department")

class PageContext(BaseModel):
    """Real-time browser page context transmitted from the Next.js storefront."""
    current_path: str = Field(default="/", description="Active browser route, e.g. '/products/P-1001'")
    viewing_product_id: Optional[str] = Field(default=None, description="Active product SKU or ID being viewed")
    viewing_product_name: Optional[str] = Field(default=None, description="Active product name")
    viewing_product_price: Optional[float] = Field(default=None, description="Active product price in PKR")
    cart_item_count: int = Field(default=0, description="Number of items in shopping cart")
    cart_total_pkr: float = Field(default=0.0, description="Total amount in shopping cart")
    customer_name: Optional[str] = Field(default=None, description="Customer full name")
    customer_city: Optional[str] = Field(default=None, description="Customer city/location")

class SupportResponse(BaseModel):
    answer: str = Field(description="The primary customer-facing response text.")
    category: str = Field(
        description="Query classification category (e.g. 'order_status', 'policy_inquiry', 'product_search', 'calculation', 'escalation', 'security_denied')"
    )
    confidence: float = Field(
        default=0.95, 
        ge=0.0, 
        le=1.0, 
        description="Confidence score of the generated answer."
    )
    requires_human: bool = Field(
        default=False, 
        description="Flag indicating whether issue requires human intervention."
    )
    sources: List[SourceCitation] = Field(
        default_factory=list, 
        description="List of knowledge base citations used in generating response."
    )
    suggested_actions: List[str] = Field(
        default_factory=list, 
        description="Suggested follow-up actions for customer."
    )
    cart_action: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata payload for real-time cart mutations (e.g. add/remove product)."
    )

class ChatRequestPayload(BaseModel):
    message: str = Field(description="Customer question or instruction.")
    conversation_id: str = Field(description="Unique conversation session identifier.")
    customer_id: Optional[str] = Field(default=None, description="Optional customer identity token.")
    provider: Optional[str] = Field(default=None, description="Optional LLM provider ('google', 'groq', 'ollama').")
    model: Optional[str] = Field(default=None, description="Optional model name (e.g. 'gemini-3.6-flash', 'openai/gpt-oss-120b').")
    search_engine: Optional[str] = Field(default=None, description="Optional search engine ('serper', 'tavily', 'gdelt', 'duckduckgo').")
    page_context: Optional[PageContext] = Field(default=None, description="Real-time website browsing context.")
