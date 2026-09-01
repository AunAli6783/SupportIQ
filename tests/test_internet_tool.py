import pytest
from unittest.mock import patch, MagicMock
from src.tools.internet_tool import search_internet, _search_serper_google
from src.agent.builder import create_support_agent
from src.schemas.parser import ResponseParser

def test_search_internet_tool_execution():
    """Verify search_internet tool executes and returns formatted search results."""
    res = search_internet.invoke({"query": "gaming laptop trends 2026"})
    assert isinstance(res, str)
    assert len(res) > 20
    assert "Title:" in res or "Source URL:" in res or "No relevant" in res

def test_serper_google_search_parsing():
    """Verify Serper.dev Google search parsing formats titles, dates, and URLs correctly."""
    mock_serper_response = {
        "news": [
            {
                "title": "Tech Titans Announce Next-Gen AI Laptops",
                "link": "https://example.com/news/1",
                "snippet": "New laptops feature ultra-fast NPU chips.",
                "date": "2 hours ago"
            }
        ],
        "organic": [
            {
                "title": "Best Laptops in 2026",
                "link": "https://example.com/laptops",
                "snippet": "Reviewing top models.",
                "date": "Yesterday"
            }
        ]
    }

    with patch("httpx.post") as mock_post:
        mock_response = MagicMock()
        mock_response.json.return_value = mock_serper_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        results = _search_serper_google("latest laptops", "fake_serper_key")
        assert len(results) == 1
        assert "Tech Titans Announce Next-Gen AI Laptops (2 hours ago)" in results[0]
        assert "Source URL: https://example.com/news/1" in results[0]

def test_agent_internet_search_routing():
    """Verify tool agent routes current trend queries to search_internet tool."""
    agent = create_support_agent()
    res = agent.invoke({
        "input": "What are the latest gaming laptop trends in 2026?",
        "chat_history": []
    })
    
    output = res.get("output", "")
    steps = res.get("intermediate_steps", [])
    
    tool_names = [action.tool for action, _ in steps]
    assert "search_internet" in tool_names
    
    parsed = ResponseParser.parse_agent_result(output, steps)
    assert parsed.category == "internet_search"
