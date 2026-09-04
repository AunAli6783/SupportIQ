from typing import Optional
from langchain_core.tools import tool
from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.utils.logger import logger

_RETRIEVER: Optional[SupportIQRetriever] = None

@tool
def search_knowledge_base(query: str, category_filter: Optional[str] = None) -> str:
    """Search NovaCart's knowledge base for policies, returns, warranty, shipping, and FAQs."""
    global _RETRIEVER
    logger.info(f"Tool Exec: search_knowledge_base(query='{query}', filter='{category_filter}')")
    
    if _RETRIEVER is None:
        _RETRIEVER = SupportIQRetriever()
        
    filter_dict = {"category": category_filter} if category_filter else None
    
    docs = _RETRIEVER.get_relevant_documents(
        query=query, 
        search_type="similarity", 
        k=2, 
        metadata_filter=filter_dict
    )
    
    # If category filter yielded no results, fallback to general semantic search
    if not docs and filter_dict:
        docs = _RETRIEVER.get_relevant_documents(
            query=query,
            search_type="similarity",
            k=2,
            metadata_filter=None
        )
    
    if not docs:
        return "Knowledge Base: No relevant documentation was found."

    # Compact document context to save tokens and avoid LLM rate limit
    for d in docs:
        if len(d.page_content) > 400:
            d.page_content = d.page_content[:400] + "..."

    formatted_context, _ = CitationEngine.format_sources(docs)
    return formatted_context
