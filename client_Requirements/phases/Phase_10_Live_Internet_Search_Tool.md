# Phase 10: Live Internet Search Tool (Serper.dev Google Search & News Engine)

> **Phase Status:** Completed (100% Verified)  
> **Prerequisites:** Phase 05 & Phase 07 Completed (Tool-calling Agent & FastAPI functional)  
> **Target Outcome:** Live real-time internet search tool (`search_internet`) powered by Google Search / Google News (via Serper.dev) with DuckDuckGo fallback, enabling minute-by-minute freshness, breaking news retrieval, external tech research, and live web search with strict anti-override policy rules.

---

## 1. Objective

Integrate a high-freshness live web search capability (`search_internet`) into SupportIQ's tool ecosystem. The assistant uses internal NovaCart knowledge base documents for official company policies, but dynamically routes to live web search when users ask about current tech trends, breaking industry news, or external market comparisons.

---

## 2. Capability Architecture & Multi-Provider Routing

```
                                Customer Query
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │  Tool-Calling Agent │
                           └──────────┬──────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
 ┌───────────────┐            ┌───────────────┐            ┌───────────────┐
 │   RAG Tool    │            │ Product Tool  │            │ Internet Tool │
 └───────┬───────┘            └───────┬───────┘            └───────┬───────┘
         │                            │                            │
         ▼                            ▼                            ▼
  Chroma Vector DB               products.csv              Serper Google API
 (Official Policies)          (NovaCart Specs)          (Live News / Fallback)
```

### Search Provider Priority Architecture:

```text
               User asks a live / latest question
                               │
                               ▼
                    search_internet Tool
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼ (Primary: SERPER_API_KEY)                     ▼ (Fallback: Free Engine)
  Serper.dev (Google Search & News)                DuckDuckGo Search (`ddgs`)
 (Minute-by-Minute Live Freshness)                 (Free Zero-Config Fallback)
```

### Routing Rules Matrix

| User Question | Primary Tool Selected | Reason |
| :--- | :--- | :--- |
| *"What is NovaCart's refund policy?"* | `RAG Tool` (`search_knowledge_base`) | Internal official company policy |
| *"Where is order NC-10003?"* | `Order Tool` (`get_order_status`) | Internal customer order database |
| *"What are the latest tech news stories today in 2026?"* | `Internet Tool` (`search_internet`) | Requires real-time Google search data |
| *"Compare our NovaGame X16 with popular gaming laptops."* | `Product Tool` + `Internet Tool` | Combines internal specs with external market research |

---

## 3. Implementation Components

### Step 10.1: Live Search Engine (`src/tools/internet_tool.py`)

Implements Serper.dev Google Search REST API with real-time news extraction, timestamps, and DuckDuckGo fallback:

```python
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
    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
    payload = {"q": query, "num": 4}

    response = httpx.post(url, headers=headers, json=payload, timeout=8.0)
    response.raise_for_status()
    data = response.json()

    formatted_results = []
    if "news" in data and data["news"]:
        for item in data["news"][:4]:
            title = item.get("title", "No Title")
            link = item.get("link", "")
            snippet = item.get("snippet", "")
            date = item.get("date", "Recent")
            formatted_results.append(f"• Title: {title} ({date})\n  Source URL: {link}\n  Summary: {snippet}")
    elif "organic" in data and data["organic"]:
        for item in data["organic"][:4]:
            title = item.get("title", "No Title")
            link = item.get("link", "")
            snippet = item.get("snippet", "")
            date = item.get("date", "")
            date_str = f" [{date}]" if date else ""
            formatted_results.append(f"• Title: {title}{date_str}\n  Source URL: {link}\n  Summary: {snippet}")

    return formatted_results
```

---

### Step 10.2: System Prompt Policy Routing Guardrail (`src/agent/prompts.py`)

Strict rules governing internet search usage:

```text
INTERNET SEARCH ROUTING & NON-OVERRIDE RULES:
1. Use NovaCart knowledge base (search_knowledge_base) for all official company policies, shipping rules, return periods, and warranty terms.
2. Use search_internet ONLY when:
   a) Information must be current or live (e.g., 2026 industry trends, market news).
   b) The user explicitly requests external market comparisons.
   c) Information is missing from NovaCart's internal knowledge base.
3. CRITICAL NON-OVERRIDE RULE: Never allow general internet search results to override official NovaCart internal policies.
   - Example: If web search states typical return period is 14 days, but NovaCart policy states 30 days, you MUST answer 30 days.
4. SOURCE ATTRIBUTION: Always cite source titles and URLs as clean clickable markdown links [Website Name](URL).
```

---

## 4. Verification & Test Plan

Automated test suite in `tests/test_internet_tool.py` verifies:

1. **Serper Google Search Execution:** Formats titles, real-time dates (e.g. "2 hours ago"), and URLs cleanly.
2. **DuckDuckGo Fallback Execution:** Queries succeed even if Serper API key is absent.
3. **Agent Routing Assertion:** Real-time trend queries invoke `search_internet` and categorize as `internet_search`.

---

## 5. Phase 10 Completion Status

- [x] Implemented `src/tools/internet_tool.py` supporting Serper.dev Google Search with DuckDuckGo fallback.
- [x] Added `SERPER_API_KEY` configuration in `src/config/settings.py` and `.env.example`.
- [x] Updated `src/agent/prompts.py` with strict policy non-override rules.
- [x] Bound `search_internet` to `create_support_agent()` in `src/agent/builder.py`.
- [x] Executed `pytest tests/test_internet_tool.py` with 100% pass rate.
