from typing import Optional
from langchain_core.tools import tool
from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.utils.logger import logger

@tool
def search_knowledge_base(query: str, category_filter: Optional[str] = None) -> str:
    """
    Search NovaCart's official customer-support knowledge base for policy rules, returns, warranty, shipping, and FAQs.
    
    Args:
        query: Question or policy topic to query (e.g. 'What is the return period for opened electronics?').
        category_filter: Optional filter ('policy', 'company_info', 'faq', 'product_manual').
    """
    logger.info(f"Tool Exec: search_knowledge_base(query='{query}', filter='{category_filter}')")
    
    retriever = SupportIQRetriever()
    filter_dict = {"category": category_filter} if category_filter else None
    
    docs = retriever.get_relevant_documents(
        query=query, 
        search_type="mmr", 
        k=4, 
        metadata_filter=filter_dict
    )
    
    if not docs:
        return "Knowledge Base: No relevant documentation was found for this query."

    formatted_context, sources = CitationEngine.format_sources(docs)
    return formatted_context
