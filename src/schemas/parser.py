import ast
import json
import re
from typing import List, Dict, Any, Optional
from src.schemas.response import SupportResponse, SourceCitation
from src.utils.logger import logger

def _clean_raw_output(raw_output: Any) -> str:
    """
    Extract human-readable text cleanly from raw string, dict, or LangChain Gemini list of chunks.
    Strips raw Python dicts, signature hashes, and internal metadata artifacts.
    """
    if not raw_output:
        return ""
    
    # 1. If raw_output is already a list (common with ChatGoogleGenerativeAI chunks)
    if isinstance(raw_output, list):
        extracted = []
        for item in raw_output:
            if isinstance(item, dict) and "text" in item:
                extracted.append(str(item["text"]))
            elif isinstance(item, str):
                extracted.append(item)
            else:
                extracted.append(str(item))
        return "\n".join(extracted).strip()

    text = str(raw_output).strip()

    # 2. If text starts with '[{' and represents a stringified list of dicts
    if (text.startswith("[{") and text.endswith("}]")) or (text.startswith("{") and text.endswith("}")):
        try:
            parsed = ast.literal_eval(text)
            if isinstance(parsed, list):
                extracted = [str(item["text"]) for item in parsed if isinstance(item, dict) and "text" in item]
                if extracted:
                    return "\n".join(extracted).strip()
            elif isinstance(parsed, dict) and "text" in parsed:
                return str(parsed["text"]).strip()
        except Exception:
            pass

    # 3. Regex fallback to extract text if stringified dictionary with signature
    if "'extras': {'signature':" in text or '"extras": {"signature":' in text:
        text_match = re.search(r"['\"]text['\"]\s*:\s*(?:\"(.*?)\"|'(.*?)'),\s*['\"](?:index|extras)", text, re.DOTALL)
        if text_match:
            matched = text_match.group(1) or text_match.group(2) or ""
            return matched.replace("\\n", "\n").replace('\\"', '"').replace("\\'", "'").strip()

    return text

class ResponseParser:
    @staticmethod
    def parse_agent_result(
        raw_output: Any, 
        intermediate_steps: Optional[List[Any]] = None
    ) -> SupportResponse:
        """
        Analyze agent output and executed tool steps to construct a validated SupportResponse.
        """
        requires_human = False
        category = "general_inquiry"
        sources = []
        confidence = 0.95

        # Format output string cleanly
        answer_text = _clean_raw_output(raw_output)

        # Inspect intermediate tool calls to categorize response & extract metadata
        if intermediate_steps:
            for action, observation in intermediate_steps:
                tool_name = action.tool
                
                if tool_name == "escalate_to_human":
                    requires_human = True
                    category = "escalation"
                    confidence = 0.50
                elif tool_name == "get_order_status":
                    category = "order_status"
                    if "SECURITY DENIED" in str(observation):
                        category = "security_denied"
                elif tool_name == "search_products":
                    category = "product_search"
                elif tool_name == "calculate":
                    category = "calculation"
                elif tool_name == "search_knowledge_base":
                    category = "policy_inquiry"
                    # Extract source references from RAG output
                    source_matches = re.findall(r"Source:\s*([a-zA-Z0-9_\-]+\.md)", str(observation))
                    for src in set(source_matches):
                        sources.append(SourceCitation(source=src))
                elif tool_name == "search_internet":
                    category = "internet_search"
                    # Extract URLs from internet search results
                    url_matches = re.findall(r"Source URL:\s*(https?://[^\s\)]+)", str(observation))
                    for url in set(url_matches):
                        sources.append(SourceCitation(source=url, category="web_search"))
                elif tool_name == "create_sales_presentation":
                    category = "presentation_generation"
                elif tool_name == "get_sales_statistics":
                    category = "sales_analytics"

        # Direct text check for escalation or denial
        if "escalated to NovaCart Senior Human Support" in answer_text or "TICKET-NC" in answer_text:
            requires_human = True
            category = "escalation"
        elif "SECURITY DENIED" in answer_text:
            category = "security_denied"
        elif "Sales_Performance_Report.pptx" in answer_text or "PowerPoint" in answer_text:
            if category == "general_inquiry":
                category = "presentation_generation"

        # Suggested follow-up actions based on category
        suggested = []
        if category == "order_status":
            suggested = ["Track delivery on carrier website", "Modify shipping address", "Cancel order"]
        elif category == "policy_inquiry":
            suggested = ["View full return policy", "Speak with an agent"]
        elif category == "escalation":
            suggested = ["Check ticket status", "Upload receipt"]
        elif category == "product_search":
            suggested = ["Compare specifications", "Check shipping time", "Place order"]
        elif category == "presentation_generation":
            suggested = ["Download PowerPoint (.pptx)", "View Product Breakdown", "Show Monthly Trends"]
        elif category == "sales_analytics":
            suggested = ["Create Sales Presentation (.pptx)", "View Top Products", "Compare Categories"]

        return SupportResponse(
            answer=answer_text.strip(),
            category=category,
            confidence=confidence,
            requires_human=requires_human,
            sources=sources,
            suggested_actions=suggested
        )
