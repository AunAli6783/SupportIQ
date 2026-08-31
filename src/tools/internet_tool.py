import time
from typing import Optional
from langchain_core.tools import tool
from src.utils.logger import logger

@tool("search_internet")
def search_internet(query: str) -> str:
    """
    Search the live internet for current information, market trends, external news, and external product details.

    Use this tool ONLY when the user asks about:
    - Latest 2026 tech trends, industry news, or market developments
    - External market product comparisons (e.g. comparing NovaCart items with competitor brands)
    - General external information not available in NovaCart's internal knowledge base
    
    Do NOT use this tool for official NovaCart shipping, return, refund, warranty, or order status questions.
    """
    logger.info(f"Tool Exec: search_internet(query='{query}')")
    
    try:
        try:
            from ddgs import DDGS
        except ImportError:
            from duckduckgo_search import DDGS
        
        results = []
        with DDGS() as ddgs:
            search_results = list(ddgs.text(query, max_results=4))
            for res in search_results:
                title = res.get("title", "No Title")
                snippet = res.get("body", "")
                url = res.get("href", "")
                results.append(f"• Title: {title}\n  Source URL: {url}\n  Summary: {snippet}")

        if not results:
            return "No relevant live web search results found."

        return "\n\n".join(results)

    except Exception as e:
        logger.error(f"Internet search execution error: {str(e)}")
        return f"Internet Search Error: Unable to complete live web search ({str(e)})."
