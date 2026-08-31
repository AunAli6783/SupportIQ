# Phase 06: Conversation Memory and Structured Outputs

> **Phase Status:** Planned  
> **Prerequisites:** Phase 05 Completed (Agentic Orchestration functional)  
> **Target Outcome:** Session-aware memory manager maintaining conversation context across multi-turn user dialogues, and a Pydantic structured output contract (`SupportResponse`) for downstream web consumers.

---

## 1. Objective

Enable SupportIQ to remember past interactions within a session (supporting follow-up questions like "When will it arrive?") and enforce a machine-readable Pydantic output model for reliable integration with the FastAPI backend and Streamlit UI.

---

## 2. Context & Output Pipeline Architecture

```
                  Customer Request + conversation_id
                                  │
                                  ▼
                     ┌───────────────────────────┐
                     │ Session Memory Manager    │  Fetch Chat History for conversation_id
                     └────────────┬──────────────┘
                                  │ (Inject History)
                                  ▼
                     ┌───────────────────────────┐
                     │ LangChain Tool Agent      │  Resolves coreferences ("it" -> NC-10003)
                     └────────────┬──────────────┘
                                  │ (Raw Agent Output & Tool Logs)
                                  ▼
                     ┌───────────────────────────┐
                     │ Structured Output Parser  │  Converts raw output to Pydantic Model
                     └────────────┬──────────────┘
                                  │
                                  ▼
                     ┌───────────────────────────┐
                     │ SupportResponse (Pydantic)│
                     │ • answer                  │
                     │ • category                │
                     │ • confidence              │
                     │ • requires_human          │
                     │ • sources                 │
                     │ • suggested_actions       │
                     └───────────────────────────┘
```

---

## 3. Implementation Components

### Step 6.1: Pydantic Response Schema (`src/schemas/response.py`)
Define structured response contracts for predictable machine parsing.

```python
from typing import List, Optional
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    source: str = Field(description="Filename of source document (e.g. 'return_policy.md')")
    category: Optional[str] = Field(default="general", description="Document policy category")
    department: Optional[str] = Field(default="customer_support", description="Owner department")

class SupportResponse(BaseModel):
    answer: str = Field(description="The primary customer-facing response text.")
    category: str = Field(
        description="Query classification category (e.g. 'order_status', 'policy_inquiry', 'product_search', 'calculation', 'escalation', 'security_denied')"
    )
    confidence: float = Field(
        default=0.95, 
        ge=0.0, 
        le=1.0, 
        description="Confidence score of the generated answer."
    )
    requires_human: bool = Field(
        default=False, 
        description="Flag indicating whether issue requires human intervention."
    )
    sources: List[SourceCitation] = Field(
        default_factory=list, 
        description="List of knowledge base citations used in generating response."
    )
    suggested_actions: List[str] = Field(
        default_factory=list, 
        description="Suggested follow-up actions for customer."
    )

class ChatRequestPayload(BaseModel):
    message: str = Field(description="Customer question or instruction.")
    conversation_id: str = Field(description="Unique conversation session identifier.")
    customer_id: Optional[str] = Field(default=None, description="Optional customer identity token.")
```

### Step 6.2: Session Memory Manager (`src/memory/session_manager.py`)
Maintain chat histories per session ID using `ChatMessageHistory`.

```python
from typing import Dict, List
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import BaseMessage
from src.utils.logger import logger

class SessionMemoryManager:
    _sessions: Dict[str, ChatMessageHistory] = {}

    @classmethod
    def get_history(cls, conversation_id: str) -> ChatMessageHistory:
        """Fetch or initialize chat history for a session."""
        if conversation_id not in cls._sessions:
            logger.info(f"Creating new session memory for conversation_id='{conversation_id}'")
            cls._sessions[conversation_id] = ChatMessageHistory()
        return cls._sessions[conversation_id]

    @classmethod
    def get_messages(cls, conversation_id: str) -> List[BaseMessage]:
        """Get message history list for agent prompt injection."""
        return cls.get_history(conversation_id).messages

    @classmethod
    def add_user_message(cls, conversation_id: str, message: str):
        """Append user input to session history."""
        cls.get_history(conversation_id).add_user_message(message)

    @classmethod
    def add_ai_message(cls, conversation_id: str, message: str):
        """Append AI response to session history."""
        cls.get_history(conversation_id).add_ai_message(message)

    @classmethod
    def clear_session(cls, conversation_id: str):
        """Purge conversation session."""
        if conversation_id in cls._sessions:
            del cls._sessions[conversation_id]
            logger.info(f"Cleared session history for conversation_id='{conversation_id}'")
```

### Step 6.3: Structured Output Parser (`src/schemas/parser.py`)
Convert agent execution observations, tool logs, and final output into a validated `SupportResponse` object.

```python
import re
from typing import List, Dict, Any
from src.schemas.response import SupportResponse, SourceCitation
from src.utils.logger import logger

class ResponseParser:
    @staticmethod
    def parse_agent_result(
        raw_output: str, 
        intermediate_steps: List[Any] = None
    ) -> SupportResponse:
        """
        Analyze agent output and executed tool steps to construct a validated SupportResponse.
        """
        requires_human = False
        category = "general_inquiry"
        sources = []
        confidence = 0.95

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

        # Direct text check for escalation or denial
        if "escalated to NovaCart Senior Human Support" in raw_output or "TICKET-NC" in raw_output:
            requires_human = True
            category = "escalation"
        elif "SECURITY DENIED" in raw_output:
            category = "security_denied"

        # Suggested follow-up actions based on category
        suggested = []
        if category == "order_status":
            suggested = ["Track delivery on carrier website", "Modify shipping address", "Cancel order"]
        elif category == "policy_inquiry":
            suggested = ["View full return policy", "Speak with an agent"]
        elif category == "escalation":
            suggested = ["Check ticket status", "Upload receipt"]

        return SupportResponse(
            answer=raw_output,
            category=category,
            confidence=confidence,
            requires_human=requires_human,
            sources=sources,
            suggested_actions=suggested
        )
```

---

## 4. Verification & Test Plan

Create `tests/test_memory_and_schemas.py` to test session history retention and response parsing.

```python
import pytest
from src.memory.session_manager import SessionMemoryManager
from src.schemas.parser import ResponseParser
from src.schemas.response import SupportResponse

def test_session_memory_retention():
    cid = "test_session_123"
    SessionMemoryManager.add_user_message(cid, "My order is NC-10003")
    SessionMemoryManager.add_ai_message(cid, "Your order NC-10003 has shipped.")
    
    msgs = SessionMemoryManager.get_messages(cid)
    assert len(msgs) == 2
    assert "NC-10003" in msgs[0].content

def test_response_parser_escalation():
    raw_output = "Your issue has been escalated. Ticket reference: TICKET-NC-123456."
    res = ResponseParser.parse_agent_result(raw_output)
    
    assert isinstance(res, SupportResponse)
    assert res.requires_human is True
    assert res.category == "escalation"
```

---

## 5. Phase 06 Checklist

- [ ] Implement `src/schemas/response.py` defining Pydantic data models.
- [ ] Implement `src/memory/session_manager.py` managing multi-turn session state.
- [ ] Implement `src/schemas/parser.py` converting agent outputs to Pydantic objects.
- [ ] Execute `pytest tests/test_memory_and_schemas.py` to confirm session persistence and schema validation.
