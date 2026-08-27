import pytest
from src.memory.session_manager import SessionMemoryManager
from src.schemas.parser import ResponseParser
from src.schemas.response import SupportResponse, SourceCitation, ChatRequestPayload

def test_session_memory_retention():
    """Verify session memory manager stores and retrieves multi-turn history."""
    cid = "test_session_123"
    SessionMemoryManager.clear_session(cid)
    
    SessionMemoryManager.add_user_message(cid, "My order is NC-10003")
    SessionMemoryManager.add_ai_message(cid, "Your order NC-10003 has shipped.")
    
    msgs = SessionMemoryManager.get_messages(cid)
    assert len(msgs) == 2
    assert "NC-10003" in msgs[0].content
    assert "shipped" in msgs[1].content.lower()

def test_session_memory_clear():
    """Verify session memory clearing purges history."""
    cid = "test_session_clear"
    SessionMemoryManager.add_user_message(cid, "Hello")
    SessionMemoryManager.clear_session(cid)
    msgs = SessionMemoryManager.get_messages(cid)
    assert len(msgs) == 0

def test_response_parser_escalation():
    """Verify response parser handles escalation category and human required flag."""
    raw_output = "Your issue has been escalated to NovaCart Senior Human Support. Ticket reference: TICKET-NC-123456."
    res = ResponseParser.parse_agent_result(raw_output)
    
    assert isinstance(res, SupportResponse)
    assert res.requires_human is True
    assert res.category == "escalation"
    assert "TICKET-NC-123456" in res.answer

def test_response_parser_security_denied():
    """Verify response parser handles security denied outputs."""
    raw_output = "SECURITY DENIED: You are not authorized to view the status of this order."
    res = ResponseParser.parse_agent_result(raw_output)
    
    assert isinstance(res, SupportResponse)
    assert res.category == "security_denied"

def test_pydantic_chat_payload_validation():
    """Verify ChatRequestPayload validation."""
    payload = ChatRequestPayload(message="Where is order NC-10001?", conversation_id="sess_99")
    assert payload.message == "Where is order NC-10001?"
    assert payload.conversation_id == "sess_99"
    assert payload.customer_id is None
