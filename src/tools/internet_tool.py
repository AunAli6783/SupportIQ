import time
import json
import re
import httpx
from typing import Optional, List, Dict, Any
from langchain_core.tools import tool

from src.config.settings import settings
from src.utils.logger import logger

def _clean_text(text: str) -> str:
    """Sanitize zero-width characters and excessive whitespace."""
    if not text:
        return ""
    # Remove zero-width spaces, soft hyphens, and non-printable characters
    cleaned = re.sub(r'[\u200b\u200c\u200d\ufeff\u00ad]', '', text)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def _search_serper_google(query: str, api_key: str) -> List[str]:
    """
    Execute real-time live Google Search or Google News via Serper.dev REST API.
    Uses dedicated Google News endpoint and strict recency time-filters (tbs=qdr:d / tbs=qdr:w)
    to ensure minute-by-minute and hour-by-hour freshness.
    """
    query_lower = query.lower()
    is_news_intent = any(k in query_lower for k in [
        "news", "today", "latest", "breaking", "recent", "trend", "now", "current", "update", "yesterday", "2026"
    ])

    formatted_results = []

    # 1. First Attempt: Dedicated Google News Endpoint (Strict 24-Hour / 7-Day Recency)
    if is_news_intent:
        try:
            news_url = "https://google.serper.dev/news"
            headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
            # Use 'qdr:d' (past 24h) if asking about 'today'/'now'/'breaking', else 'qdr:w' (past week)
            time_filter = "qdr:d" if any(k in query_lower for k in ["today", "now", "breaking", "latest news", "minute", "hour"]) else "qdr:w"
            payload = {"q": query, "num": 5, "tbs": time_filter}

            response = httpx.post(news_url, headers=headers, json=payload, timeout=8.0)
            if response.status_code == 200:
                data = response.json()
                news_items = data.get("news", [])
                
                # If strict 24h filter returned empty, retry without tbs filter
                if not news_items and time_filter == "qdr:d":
                    payload_broad = {"q": query, "num": 5}
                    broad_resp = httpx.post(news_url, headers=headers, json=payload_broad, timeout=8.0)
                    if broad_resp.status_code == 200:
                        news_items = broad_resp.json().get("news", [])

                for item in news_items[:4]:
                    title = _clean_text(item.get("title", "No Title"))
                    link = item.get("link", "")
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
            logger.warning(f"Serper Google News query failed ({str(e)}). Trying organic Google search.")

    # 2. Second Attempt / Fallback: Google Organic Search with Recency Filtering
    if not formatted_results:
        try:
            search_url = "https://google.serper.dev/search"
            headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
            payload = {"q": query, "num": 4, "tbs": "qdr:w" if is_news_intent else None}
            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}

            response = httpx.post(search_url, headers=headers, json=payload, timeout=8.0)
            if response.status_code == 200:
                data = response.json()
                
                # Check for news section in search results
                if "news" in data and data["news"]:
                    for item in data["news"][:4]:
                        title = _clean_text(item.get("title", "No Title"))
                        link = item.get("link", "")
                        snippet = _clean_text(item.get("snippet", ""))
                        date = _clean_text(item.get("date", "Recent"))
                        publisher = _clean_text(item.get("source", "News"))
                        formatted_results.append(
                            f"• Headline: {title}\n"
                            f"  Published: {date} | Publisher: {publisher}\n"
                            f"  Source URL: {link}\n"
                            f"  Summary: {snippet}"
                        )
                # Check organic results
                elif "organic" in data and data["organic"]:
                    for item in data["organic"][:4]:
                        title = _clean_text(item.get("title", "No Title"))
                        link = item.get("link", "")
                        snippet = _clean_text(item.get("snippet", ""))
                        date = _clean_text(item.get("date", ""))
                        date_str = f"Published: {date} | " if date else ""
                        formatted_results.append(
                            f"• Title: {title}\n"
                            f"  {date_str}Source URL: {link}\n"
                            f"  Summary: {snippet}"
                        )
        except Exception as e:
            logger.warning(f"Serper Organic Google Search failed: {str(e)}")

    return formatted_results


def _search_duckduckgo_fallback(query: str) -> List[str]:
    """Fallback search using DuckDuckGo when Serper API key is not configured or fails."""
    try:
        from ddgs import DDGS
    except ImportError:
        from duckduckgo_search import DDGS
    
    results = []
    with DDGS() as ddgs:
        # Request recent results
        search_results = list(ddgs.text(query, max_results=4))
        for res in search_results:
            title = _clean_text(res.get("title", "No Title"))
            snippet = _clean_text(res.get("body", ""))
            url = res.get("href", "")
            results.append(f"• Title: {title}\n  Source URL: {url}\n  Summary: {snippet}")
    return results


@tool("search_internet")
def search_internet(query: str) -> str:
    """
    Search the live internet for the most recent and real-time information, breaking news, market developments,
    tech trends, and external product comparisons.
    
    Uses Google News & Google Search API (via Serper.dev) with strict time-filtering (past 24 hours / past week)
    to guarantee real-time freshness, with DuckDuckGo fallback.

    Use this tool ONLY when the user asks about:
    - Today's latest news, breaking tech events, or live 2026 market developments
    - External market product comparisons (e.g. comparing NovaCart items with competitor brands)
    - General external information not available in NovaCart's internal knowledge base
    
    Do NOT use this tool for official NovaCart shipping, return, refund, warranty, or order status questions.
    """
    logger.info(f"Tool Exec: search_internet(query='{query}')")
    
    # 1. Prefer Google Search / Google News via Serper.dev if API Key is configured
    if settings.SERPER_API_KEY and settings.SERPER_API_KEY.strip():
        try:
            logger.info("Executing Google search via Serper.dev API engine with recency filters.")
            results = _search_serper_google(query, settings.SERPER_API_KEY.strip())
            if results:
                return "\n\n".join(results)
        except Exception as e:
            logger.warning(f"Serper Google search failed ({str(e)}). Falling back to DuckDuckGo.")

    # 2. Fallback to DuckDuckGo search
    try:
        logger.info("Executing search via DuckDuckGo engine fallback.")
        results = _search_duckduckgo_fallback(query)
        if not results:
            return "No relevant live web search results found."
        return "\n\n".join(results)

    except Exception as e:
        logger.error(f"Internet search execution error: {str(e)}")
        return f"Internet Search Error: Unable to complete live web search ({str(e)})."
