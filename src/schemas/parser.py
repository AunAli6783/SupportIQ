import re
from typing import List, Dict, Any, Optional
from src.schemas.response import SupportResponse, SourceCitation
from src.utils.logger import logger

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

        # Format output string cleanly whether raw_output is a string or list of dicts
        if isinstance(raw_output, list):
            answer_text = "\n".join([item.get("text", str(item)) for item in raw_output if isinstance(item, dict)])
        else:
            answer_text = str(raw_output)

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
                    url_matches = re.findall(r"Source URL:\s*(https?://[^\s]+)", str(observation))
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
