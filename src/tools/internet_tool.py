import time
import json
import httpx
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from src.config.settings import settings
from src.utils.logger import logger

def _search_serper_google(query: str, api_key: str) -> List[str]:
    """Execute live Google Search via Serper.dev REST API with real-time freshness."""
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "q": query,
        "num": 4
    }

    response = httpx.post(url, headers=headers, json=payload, timeout=8.0)
    response.raise_for_status()
    data = response.json()

    formatted_results = []

    # 1. Check for real-time news items first
    if "news" in data and data["news"]:
        for item in data["news"][:4]:
            title = item.get("title", "No Title")
            link = item.get("link", "")
            snippet = item.get("snippet", "")
            date = item.get("date", "Recent")
            formatted_results.append(f"• Title: {title} ({date})\n  Source URL: {link}\n  Summary: {snippet}")

    # 2. Check organic search results
    elif "organic" in data and data["organic"]:
        for item in data["organic"][:4]:
            title = item.get("title", "No Title")
            link = item.get("link", "")
            snippet = item.get("snippet", "")
            date = item.get("date", "")
            date_str = f" [{date}]" if date else ""
            formatted_results.append(f"• Title: {title}{date_str}\n  Source URL: {link}\n  Summary: {snippet}")

    return formatted_results


def _search_duckduckgo_fallback(query: str) -> List[str]:
    """Fallback search using DuckDuckGo when Serper API key is not configured."""
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
    return results


@tool("search_internet")
def search_internet(query: str) -> str:
    """
    Search the live internet for current information, market trends, external news, and external product details.
    Uses Google Search API (Serper.dev) for real-time minute-by-minute freshness, with DuckDuckGo fallback.

    Use this tool ONLY when the user asks about:
    - Latest 2026 tech trends, breaking news, or market developments
    - External market product comparisons (e.g. comparing NovaCart items with competitor brands)
    - General external information not available in NovaCart's internal knowledge base
    
    Do NOT use this tool for official NovaCart shipping, return, refund, warranty, or order status questions.
    """
    logger.info(f"Tool Exec: search_internet(query='{query}')")
    
    # 1. Prefer Google Search via Serper.dev if API Key is configured
    if settings.SERPER_API_KEY and settings.SERPER_API_KEY.strip():
        try:
            logger.info("Executing Google search via Serper.dev API engine.")
            results = _search_serper_google(query, settings.SERPER_API_KEY.strip())
            if results:
                return "\n\n".join(results)
        except Exception as e:
            logger.warning(f"Serper Google search failed ({str(e)}). Falling back to DuckDuckGo.")

    # 2. Fallback to DuckDuckGo search
    try:
        logger.info("Executing search via DuckDuckGo engine.")
        results = _search_duckduckgo_fallback(query)
        if not results:
            return "No relevant live web search results found."
        return "\n\n".join(results)

    except Exception as e:
        logger.error(f"Internet search execution error: {str(e)}")
        return f"Internet Search Error: Unable to complete live web search ({str(e)})."
