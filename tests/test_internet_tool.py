import pytest
from src.tools.internet_tool import search_internet
from src.agent.builder import create_support_agent
from src.schemas.parser import ResponseParser

def test_search_internet_tool_execution():
    """Verify search_internet tool executes and returns formatted search results."""
    res = search_internet.invoke({"query": "gaming laptop trends 2026"})
    assert isinstance(res, str)
    assert len(res) > 20
    assert "Title:" in res or "Source URL:" in res or "No relevant" in res

def test_agent_internet_search_routing():
    """Verify tool agent routes current trend queries to search_internet tool."""
    agent = create_support_agent()
    res = agent.invoke({
        "input": "What are the latest gaming laptop trends in 2026?",
        "chat_history": []
    })
    
    output = res.get("output", "")
    steps = res.get("intermediate_steps", [])
    
    # Check if search_internet was invoked in steps
    tool_names = [action.tool for action, _ in steps]
    assert "search_internet" in tool_names
    
    parsed = ResponseParser.parse_agent_result(output, steps)
    assert parsed.category == "internet_search"
