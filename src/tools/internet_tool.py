import time
import json
import re
import httpx
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from src.config.settings import settings
from src.utils.logger import logger

def _clean_text(text: str) -> str:
    """Sanitize zero-width characters, excessive whitespace, and raw markdown headings."""
    if not text:
        return ""
    cleaned = re.sub(r'[\u200b\u200c\u200d\ufeff\u00ad]', '', text)
    # Remove markdown header syntax
    cleaned = re.sub(r'#{1,6}\s*', '', cleaned)
    # Remove excessive whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def _search_tavily(query: str, api_key: str) -> List[str]:
    """Execute live web search via Tavily AI Search API."""
    url = "https://api.tavily.com/search"
    query_lower = query.lower()
    is_news = any(k in query_lower for k in ["news", "today", "latest", "breaking", "recent", "trend", "current", "2026"])
    
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": 4,
        "topic": "news" if is_news else "general"
    }

    response = httpx.post(url, json=payload, timeout=8.0)
    response.raise_for_status()
    data = response.json()

    results = []
    for item in data.get("results", [])[:4]:
        title = _clean_text(item.get("title", "No Title"))
        url_link = item.get("url", "")
        raw_content = _clean_text(item.get("content", ""))
        # Truncate overly long content to 350 characters for crisp summary
        content = raw_content[:350] + "..." if len(raw_content) > 350 else raw_content
        published_date = _clean_text(item.get("published_date", "Recent"))
        results.append(
            f"• Headline: {title}\n"
            f"  Published: {published_date} | Source: Tavily AI Index\n"
            f"  Source URL: {url_link}\n"
            f"  Summary: {content}"
        )
    return results

def _search_serper_google(query: str, api_key: str) -> List[str]:
    """
    Execute comprehensive real-time Google Search via Serper.dev.
    Queries both Google News (for latest developing updates, 2-4 days ago, hours ago)
    and Google Organic Search, merging results to guarantee maximum freshness and accuracy.
    """
    formatted_results = []
    seen_urls = set()

    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}

    # 1. ALWAYS Query Google News First (Captures 1-hour, 1-day, 2-day, 4-day developing stories)
    try:
        news_url = "https://google.serper.dev/news"
        payload_news = {"q": query, "num": 5}
        response_news = httpx.post(news_url, headers=headers, json=payload_news, timeout=8.0)
        
        if response_news.status_code == 200:
            news_items = response_news.json().get("news", [])
            for item in news_items:
                link = item.get("link", "")
                if link and link not in seen_urls:
                    seen_urls.add(link)
                    title = _clean_text(item.get("title", "No Title"))
                    publisher = _clean_text(item.get("source", "Google News"))
                    date = _clean_text(item.get("date", "Recent"))
                    snippet = _clean_text(item.get("snippet", ""))
                    formatted_results.append(
                        f"• Headline: {title}\n"
                        f"  Published: {date} | Publisher: {publisher}\n"
                        f"  Source URL: {link}\n"
                        f"  Summary: {snippet}"
                    )
    except Exception as e:
        logger.warning(f"Google News query failed ({str(e)}). Proceeding with organic search.")

    # 2. Query Google Organic Search with Recent Time Filtering (Past Week / Month)
    try:
        search_url = "https://google.serper.dev/search"
        payload_search = {"q": query, "num": 5, "tbs": "qdr:m"}
        response_search = httpx.post(search_url, headers=headers, json=payload_search, timeout=8.0)
        
        if response_search.status_code == 200:
            data = response_search.json()
            
            for item in data.get("organic", []):
                link = item.get("link", "")
                if link and link not in seen_urls:
                    seen_urls.add(link)
                    title = _clean_text(item.get("title", "No Title"))
                    snippet = _clean_text(item.get("snippet", ""))
                    date = _clean_text(item.get("date", ""))
                    date_str = f"Published: {date} | " if date else ""
                    formatted_results.append(
                        f"• Title: {title}\n"
                        f"  {date_str}Source URL: {link}\n"
                        f"  Summary: {snippet}"
                    )
    except Exception as e:
        logger.warning(f"Google Organic Search failed ({str(e)}).")

    return formatted_results[:4]


def _search_duckduckgo_fallback(query: str) -> List[str]:
    """Fallback search using DuckDuckGo when API keys are not configured or fail."""
    try:
        from ddgs import DDGS
    except ImportError:
        from duckduckgo_search import DDGS
    
    results = []
    with DDGS() as ddgs:
        search_results = list(ddgs.text(query, max_results=4))
        for res in search_results:
            title = _clean_text(res.get("title", "No Title"))
            snippet = _clean_text(res.get("body", ""))
            url = res.get("href", "")
            results.append(f"• Title: {title}\n  Source URL: {url}\n  Summary: {snippet}")
    return results


@tool("search_internet")
def search_internet(query: str = "") -> str:
    """
    Search the live internet for the most recent and real-time information, breaking news, market developments,
    tech trends, and external product comparisons.
    
    Supports Google Search & Google News (via Serper.dev), Tavily AI Search (via Tavily API), and DuckDuckGo fallback.

    Use this tool ONLY when the user asks about:
    - Recent news, breaking tech events, developing stories, or live 2026 market developments
    - External market product comparisons (e.g. comparing NovaCart items with competitor brands)
    - General external information not available in NovaCart's internal knowledge base
    
    Do NOT use this tool for official NovaCart shipping, return, refund, warranty, or order status questions.
    """
    logger.info(f"Tool Exec: search_internet(query='{query}')")
    
    if not query or not query.strip():
        return "No search query provided."

    # 1. Check Tavily if configured
    if settings.TAVILY_API_KEY and settings.TAVILY_API_KEY.strip():
        try:
            logger.info("Executing search via Tavily AI Search API.")
            results = _search_tavily(query, settings.TAVILY_API_KEY.strip())
            if results:
                return "\n\n".join(results)
        except Exception as e:
            logger.warning(f"Tavily search failed ({str(e)}). Trying Serper.")

    # 2. Check Google Search / Google News via Serper.dev if API Key is configured
    if settings.SERPER_API_KEY and settings.SERPER_API_KEY.strip():
        try:
            logger.info("Executing dual Google News & Search via Serper.dev engine.")
            results = _search_serper_google(query, settings.SERPER_API_KEY.strip())
            if results:
                return "\n\n".join(results)
        except Exception as e:
            logger.warning(f"Serper Google search failed ({str(e)}). Falling back to DuckDuckGo.")

    # 3. Fallback to DuckDuckGo search
    try:
        logger.info("Executing search via DuckDuckGo engine fallback.")
        results = _search_duckduckgo_fallback(query)
        if not results:
            return "No relevant live web search results found."
        return "\n\n".join(results)

    except Exception as e:
        logger.error(f"Internet search execution error: {str(e)}")
        return f"Internet Search Error: Unable to complete live web search ({str(e)})."
