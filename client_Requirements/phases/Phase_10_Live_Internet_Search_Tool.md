# Phase 10: Live Internet Search Tool

> **Phase Status:** Planned  
> **Prerequisites:** Phase 05 & Phase 07 Completed (Tool-calling Agent & FastAPI functional)  
> **Target Outcome:** Live real-time internet search tool (`search_internet`) equipped to the agent, enabling real-time market trend queries, external tech research, and live web search with strict anti-override policy rules.

---

## 1. Objective

Integrate a live web search capability (`search_internet`) into SupportIQ's tool ecosystem. The assistant uses internal NovaCart knowledge base documents for official company policies, but dynamically routes to live web search when users ask about current 2026 tech trends, latest industry news, or external market comparisons.

---

## 2. Capability Architecture & Decision Routing

```
                               Customer Query
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Tool-Calling Agent │
                          └──────────┬──────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │   RAG Tool    │           │ Product Tool  │           │ Internet Tool │
 └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
         │                           │                           │
         ▼                           ▼                           ▼
  Chroma Vector DB              products.csv                 Live Web API
 (Official Policies)         (NovaCart Specs)          (Current 2026 Trends)
```

### Routing Rules Matrix

| User Question | Primary Tool Selected | Reason |
| :--- | :--- | :--- |
| *"What is NovaCart's refund policy?"* | `RAG Tool` (`search_knowledge_base`) | Internal official company policy |
| *"Where is order NC-10003?"* | `Order Tool` (`get_order_status`) | Internal customer order database |
| *"What are the latest laptop trends in 2026?"* | `Internet Tool` (`search_internet`) | Requires live external market data |
| *"Compare our NovaGame X16 with popular gaming laptops."* | `Product Tool` + `Internet Tool` | Combines internal specs with external market research |

---

## 3. Implementation Components

### Step 10.1: Free Internet Search Tool (`src/tools/internet_tool.py`)

Implement `search_internet` using a free search integration (e.g. DuckDuckGo Search `ddgs` or Tavily/Serper free tier wrapper) encapsulated behind a clean tool interface.

```python
import time
from typing import Optional
from langchain_core.tools import tool
from src.utils.logger import logger

@tool("search_internet")
def search_internet(query: str) -> str:
    """
    Search the live internet for current information, market trends, and external products.

    Use this tool ONLY when the user asks about:
    - Latest 2026 tech trends or current news
    - External market product comparisons
    - General tech knowledge not available in NovaCart's internal knowledge base
    
    Do NOT use for official NovaCart shipping, return, warranty, or order status questions.
    """
    logger.info(f"Tool Exec: search_internet(query='{query}')")
    
    try:
        # Provider Wrapper (DuckDuckGo / Tavily free search)
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
```

---

### Step 10.2: System Prompt Policy Routing Guardrail (`src/agent/prompts.py`)

Update `SYSTEM_PROMPT_TEMPLATE` with strict rules governing internet search usage:

```text
INTERNET SEARCH ROUTING & NON-OVERRIDE RULES:
1. Use NovaCart knowledge base (search_knowledge_base) for all official company policies, shipping rules, return periods, and warranty terms.
2. Use search_internet ONLY when:
   a) Information must be current or live (e.g., 2026 industry trends, market news).
   b) The user explicitly requests external market comparisons.
   c) Information is missing from NovaCart's internal knowledge base.
3. CRITICAL NON-OVERRIDE RULE: Never allow general internet search results to override official NovaCart internal policies.
   - Example: If web search states typical return period is 14 days, but NovaCart policy states 30 days, you MUST answer 30 days.
4. SOURCE ATTRIBUTION: Always cite source titles and URLs when incorporating live web search results.
```

---

## 4. Verification & Test Plan

Create `tests/test_internet_tool.py` to verify:

1. **Live Search Query Execution:** Querying current trends returns title and source URL attributions.
2. **Policy Non-Override Assertion:** Asking about return policy ignores general web 14-day rules and enforces NovaCart's 30-day policy.
3. **Error & Timeout Resilience:** Network timeouts fail gracefully with clear fallback messages.

---

## 5. Phase 10 Checklist

- [ ] Implement `src/tools/internet_tool.py` containing `search_internet`.
- [ ] Update `src/agent/prompts.py` with strict policy non-override rules.
- [ ] Bind `search_internet` to `create_support_agent()` in `src/agent/builder.py`.
- [ ] Execute `pytest tests/test_internet_tool.py` to confirm tool execution and policy routing.
