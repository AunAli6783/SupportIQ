import json
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from sse_starlette.sse import EventSourceResponse

from src.schemas.response import ChatRequestPayload, SupportResponse
from src.schemas.parser import ResponseParser
from src.agent.builder import create_support_agent
from src.agent.security import SecurityGuard
from src.memory.session_manager import SessionMemoryManager
from src.utils.logger import logger

router = APIRouter()

@router.post("/chat", response_model=SupportResponse, tags=["Chat"])
async def chat_endpoint(payload: ChatRequestPayload):
    """Synchronous endpoint returning complete structured SupportResponse."""
    logger.info(f"Chat endpoint request received for conversation_id='{payload.conversation_id}'")
    
    # 1. Security Check
    is_safe, sec_msg = SecurityGuard.inspect_incoming_prompt(payload.message)
    if not is_safe:
        return ResponseParser.parse_agent_result(sec_msg)

    # 2. Retrieve history & append user message
    history = SessionMemoryManager.get_messages(payload.conversation_id)
    SessionMemoryManager.add_user_message(payload.conversation_id, payload.message)

    # 3. Execute Agent
    agent = create_support_agent()
    try:
        response_dict = agent.invoke({
            "input": payload.message,
            "chat_history": history,
            "requesting_customer_id": payload.customer_id
        })
        
        raw_output = response_dict.get("output", "")
        intermediate_steps = response_dict.get("intermediate_steps", [])
        
        # Save AI response to memory
        SessionMemoryManager.add_ai_message(payload.conversation_id, str(raw_output))
        
        # 4. Parse into structured output
        return ResponseParser.parse_agent_result(raw_output, intermediate_steps)

    except Exception as e:
        logger.error(f"Chat endpoint execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal agent execution failure: {str(e)}")


@router.post("/chat/stream", tags=["Chat"])
async def stream_chat_endpoint(payload: ChatRequestPayload):
    """Server-Sent Events (SSE) streaming endpoint for live responses."""
    logger.info(f"Stream chat request received for conversation_id='{payload.conversation_id}'")
    
    async def event_generator():
        # Security Inspection
        is_safe, sec_msg = SecurityGuard.inspect_incoming_prompt(payload.message)
        if not is_safe:
            yield {"event": "error", "data": json.dumps({"error": sec_msg})}
            return

        # Fetch history
        history = SessionMemoryManager.get_messages(payload.conversation_id)
        SessionMemoryManager.add_user_message(payload.conversation_id, payload.message)
        
        agent = create_support_agent()
        
        try:
            result = agent.invoke({
                "input": payload.message, 
                "chat_history": history,
                "requesting_customer_id": payload.customer_id
            })
            full_text = str(result.get("output", ""))
            
            # Stream word-by-word tokens with simulated typing delay
            words = full_text.split(" ")
            for word in words:
                yield {"event": "message", "data": json.dumps({"token": word + " "})}
                await asyncio.sleep(0.03)

            SessionMemoryManager.add_ai_message(payload.conversation_id, full_text)
            yield {"event": "done", "data": json.dumps({"status": "completed"})}

        except Exception as e:
            logger.error(f"Streaming chat error: {str(e)}")
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
