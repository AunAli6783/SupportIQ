import time
import json
import re
import httpx
from urllib.parse import urlparse
from contextvars import ContextVar
from typing import Optional, List, Dict, Any, Set
from langchain_core.tools import tool

from src.config.settings import settings
from src.utils.logger import logger

# ContextVar for active search engine per request
_active_search_engine: ContextVar[str] = ContextVar("active_search_engine", default="serper")

def set_active_search_engine(engine: str):
    """Set active search engine for current request context ('serper', 'tavily', or 'duckduckgo')."""
    if engine:
        _active_search_engine.set(engine.lower().strip())
        logger.info(f"Active search engine set to: {engine.lower().strip()}")

def get_active_search_engine() -> str:
    """Get active search engine for current request context."""
    return _active_search_engine.get()

def _clean_text(text: str) -> str:
    """Sanitize zero-width characters, excessive whitespace, and raw markdown headings."""
    if not text:
        return ""
    cleaned = re.sub(r'[\u200b\u200c\u200d\ufeff\u00ad]', '', text)
    cleaned = re.sub(r'#{1,6}\s*', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def _get_domain(url: str) -> str:
    """Extract domain host from URL."""
    try:
        domain = urlparse(url).netloc.lower()
        return domain.replace("www.", "")
    except Exception:
        return ""

def _search_tavily(query: str, api_key: str) -> List[str]:
    """
    Execute live web search via Tavily AI Search API with recency prompts and domain diversity.
    """
    url = "https://api.tavily.com/search"
    query_lower = query.lower()
    is_news = any(k in query_lower for k in ["news", "today", "latest", "breaking", "recent", "trend", "current", "2026", "update"])
    
    payload: Dict[str, Any] = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": 6,
        "topic": "news" if is_news else "general",
        "time_range": "w" if is_news else None
    }
    payload = {k: v for k, v in payload.items() if v is not None}

    response = httpx.post(url, json=payload, timeout=8.0)
    response.raise_for_status()
    data = response.json()

    results = []
    seen_domains: Set[str] = set()

    for item in data.get("results", []):
        url_link = item.get("url", "")
        domain = _get_domain(url_link)
        
        # Enforce source diversity (maximum 1 article per domain)
        if domain and domain in seen_domains:
            continue
        if domain:
            seen_domains.add(domain)

        title = _clean_text(item.get("title", "No Title"))
        raw_content = _clean_text(item.get("content", ""))
        content = raw_content[:350] + "..." if len(raw_content) > 350 else raw_content
        published_date = _clean_text(item.get("published_date", "Recent"))
        results.append(
            f"• Headline: {title}\n"
            f"  Published: {published_date} | Source: {domain or 'Tavily AI'}\n"
            f"  Source URL: {url_link}\n"
            f"  Summary: {content}"
        )
        if len(results) >= 4:
            break

    return results

def _search_serper_google(query: str, api_key: str) -> List[str]:
    """
    Execute comprehensive real-time Google Search via Serper.dev.
    Queries both Google News and Google Organic Search with strict recency filtering and domain diversity.
    """
    formatted_results = []
    seen_urls: Set[str] = set()
    seen_domains: Set[str] = set()

    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}

    # 1. Query Google News First (Captures hour-by-hour & day-by-day breaking news)
    try:
        news_url = "https://google.serper.dev/news"
        payload_news = {"q": query, "num": 6, "tbs": "qdr:w"}
        response_news = httpx.post(news_url, headers=headers, json=payload_news, timeout=8.0)
        
        if response_news.status_code == 200:
            news_items = response_news.json().get("news", [])
            for item in news_items:
                link = item.get("link", "")
                domain = _get_domain(link)
                if link and link not in seen_urls and (not domain or domain not in seen_domains):
                    seen_urls.add(link)
                    if domain: seen_domains.add(domain)
                    title = _clean_text(item.get("title", "No Title"))
                    publisher = _clean_text(item.get("source", domain or "Google News"))
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
        payload_search = {"q": query, "num": 6, "tbs": "qdr:w"}
        response_search = httpx.post(search_url, headers=headers, json=payload_search, timeout=8.0)
        
        if response_search.status_code == 200:
            data = response_search.json()
            for item in data.get("organic", []):
                link = item.get("link", "")
                domain = _get_domain(link)
                if link and link not in seen_urls and (not domain or domain not in seen_domains):
                    seen_urls.add(link)
                    if domain: seen_domains.add(domain)
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
    """Fallback search using DuckDuckGo with weekly recency filter and domain diversity."""
    try:
        from ddgs import DDGS
    except ImportError:
        from duckduckgo_search import DDGS
    
    results = []
    seen_domains: Set[str] = set()

    with DDGS() as ddgs:
        search_results = list(ddgs.text(query, max_results=6, timelimit="w"))
        for res in search_results:
            url = res.get("href", "")
            domain = _get_domain(url)
            if domain and domain in seen_domains:
                continue
            if domain:
                seen_domains.add(domain)

            title = _clean_text(res.get("title", "No Title"))
            snippet = _clean_text(res.get("body", ""))
            results.append(f"• Title: {title}\n  Source URL: {url}\n  Summary: {snippet}")
            if len(results) >= 4:
                break
    return results


@tool("search_internet")
def search_internet(query: str = "") -> str:
    """
    Search the live internet for recent information, breaking news, market developments,
    tech trends, and external product comparisons.
    
    Dynamically routes to user-selected search provider (Google Serper, Tavily AI, or DuckDuckGo)
    with strict recency filtering and publisher domain diversity.
    """
    if not query or not query.strip():
        return "No search query provided."

    engine = get_active_search_engine()
    logger.info(f"Tool Exec: search_internet(query='{query}') [Selected Engine: {engine}]")

    # 1. Route to Tavily if selected
    if engine == "tavily":
        if settings.TAVILY_API_KEY and settings.TAVILY_API_KEY.strip():
            try:
                logger.info("Executing search via Tavily AI Search API with recency filters.")
                results = _search_tavily(query, settings.TAVILY_API_KEY.strip())
                if results:
                    return "\n\n".join(results)
            except Exception as e:
                logger.warning(f"Tavily search failed ({str(e)}). Trying fallback.")
        else:
            logger.warning("Tavily API key not found in .env. Falling back to Google Serper.")

    # 2. Route to Serper Google Search if selected (or default)
    if engine in ["serper", "google"]:
        if settings.SERPER_API_KEY and settings.SERPER_API_KEY.strip():
            try:
                logger.info("Executing dual Google News & Search via Serper.dev engine with recency filters.")
                results = _search_serper_google(query, settings.SERPER_API_KEY.strip())
                if results:
                    return "\n\n".join(results)
            except Exception as e:
                logger.warning(f"Serper Google search failed ({str(e)}). Falling back.")
        else:
            logger.warning("Serper API key not found in .env.")

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
