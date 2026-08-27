from langchain_core.tools import tool
from src.utils.logger import logger

@tool
def escalate_to_human(customer_issue: str, priority: str = "HIGH", reason: str = "Unresolved") -> str:
    """
    Escalate customer issue to human support agent for double charges, legal disputes, fraud, or unhandled requests.
    
    Args:
        customer_issue: Detailed summary of customer's complaint or request.
        priority: Urgency level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').
        reason: Categorical reason ('billing_dispute', 'legal_complaint', 'low_confidence', 'customer_request').
    """
    logger.info(f"Tool Exec: escalate_to_human(priority='{priority}', reason='{reason}')")
    ticket_id = f"TICKET-NC-{abs(hash(customer_issue)) % 1000000:06d}"
    
    return (
        f"ESCALATION SUCCESSFUL:\n"
        f"- Ticket Reference: {ticket_id}\n"
        f"- Priority: {priority}\n"
        f"- Reason: {reason}\n"
        f"- Message to Customer: Your request has been escalated to NovaCart Senior Human Support. "
        f"A human agent will review ticket '{ticket_id}' within 24 hours."
    )
