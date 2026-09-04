import json
import asyncio
from fastapi import APIRouter, HTTPException, Depends
from sse_starlette.sse import EventSourceResponse

from src.schemas.response import ChatRequestPayload, SupportResponse
from src.schemas.parser import ResponseParser, _clean_raw_output
from src.agent.builder import create_support_agent
from src.agent.security import SecurityGuard
from src.agent.context import format_page_context
from src.memory.session_manager import SessionMemoryManager
from src.tools.internet_tool import set_active_search_engine
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

    # Set active search engine for this request
    if payload.search_engine:
        set_active_search_engine(payload.search_engine)

    # 2. Format Page Context
    page_context_str = format_page_context(payload.page_context) or "No active browsing context provided."

    # 3. Retrieve history (limited to last 6 messages, before current user message)
    history = SessionMemoryManager.get_messages(payload.conversation_id, limit=6)

    # 4. Execute Agent with live page context & automatic zero-delay fallback
    agent = create_support_agent(
        provider=payload.provider, 
        model_name=payload.model
    )
    
    agent_input = {
        "input": payload.message,
        "chat_history": history,
        "page_context_str": page_context_str,
        "requesting_customer_id": payload.customer_id
    }

    try:
        response_dict = agent.invoke(agent_input)
    except Exception as exec_err:
        logger.warning(f"Primary agent ({payload.provider}) execution failed: {exec_err}. Attempting secondary provider fallback...")
        try:
            alt_provider = "google" if payload.provider == "groq" else "groq"
            alt_model = "gemini-3.6-flash" if alt_provider == "google" else "openai/gpt-oss-20b"
            fallback_agent = create_support_agent(provider=alt_provider, model_name=alt_model)
            response_dict = fallback_agent.invoke(agent_input)
        except Exception as alt_err:
            logger.warning(f"Secondary agent failed: {alt_err}. Executing direct knowledge base fallback...")
            from src.tools.knowledge_tool import search_knowledge_base
            kb_res = search_knowledge_base.invoke({"query": payload.message})
            response_dict = {
                "output": f"{kb_res}\n\n*If you have specific order questions, please provide your Order ID.*",
                "intermediate_steps": []
            }

    try:
        raw_output = response_dict.get("output", "")
        intermediate_steps = response_dict.get("intermediate_steps", [])
        clean_text = _clean_raw_output(raw_output)
        
        # Save both user query and AI response to memory
        SessionMemoryManager.add_user_message(payload.conversation_id, payload.message)
        SessionMemoryManager.add_ai_message(payload.conversation_id, clean_text)
        
        # 5. Parse into structured output
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

        # Format Page Context
        page_context_str = format_page_context(payload.page_context) or "No active browsing context provided."

        # Set active search engine
        if payload.search_engine:
            set_active_search_engine(payload.search_engine)

        # Fetch history (last 6 messages)
        history = SessionMemoryManager.get_messages(payload.conversation_id, limit=6)
        
        agent = create_support_agent(
            provider=payload.provider,
            model_name=payload.model
        )
        
        agent_input = {
            "input": payload.message, 
            "chat_history": history,
            "page_context_str": page_context_str,
            "requesting_customer_id": payload.customer_id
        }

        try:
            try:
                result = agent.invoke(agent_input)
            except Exception as exec_err:
                logger.warning(f"Streaming primary agent error: {exec_err}. Attempting fallback...")
                try:
                    alt_provider = "google" if payload.provider == "groq" else "groq"
                    alt_model = "gemini-3.6-flash" if alt_provider == "google" else "openai/gpt-oss-20b"
                    fallback_agent = create_support_agent(provider=alt_provider, model_name=alt_model)
                    result = fallback_agent.invoke(agent_input)
                except Exception as alt_err:
                    logger.warning(f"Secondary streaming fallback failed: {alt_err}. Falling back to knowledge retrieval...")
                    from src.tools.knowledge_tool import search_knowledge_base
                    kb_res = search_knowledge_base.invoke({"query": payload.message})
                    result = {"output": str(kb_res)}

            full_text = str(result.get("output", ""))
            clean_text = _clean_raw_output(full_text)
            
            # Stream word-by-word tokens with smooth simulated typing delay
            words = clean_text.split(" ")
            for word in words:
                yield {"event": "message", "data": json.dumps({"token": word + " "})}
                await asyncio.sleep(0.01)

            SessionMemoryManager.add_user_message(payload.conversation_id, payload.message)
            SessionMemoryManager.add_ai_message(payload.conversation_id, clean_text)
            yield {"event": "done", "data": json.dumps({"status": "completed"})}

        except Exception as e:
            logger.error(f"Streaming chat error: {str(e)}")
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())


@router.get("/chat/history/{conversation_id}", tags=["Chat"])
async def get_chat_history_endpoint(conversation_id: str):
    """Retrieve formatted chat history for a session ID."""
    history = SessionMemoryManager.get_formatted_history(conversation_id)
    return {"conversation_id": conversation_id, "messages": history}


@router.delete("/chat/session/{conversation_id}", tags=["Chat"])
async def clear_chat_session_endpoint(conversation_id: str):
    """Clear memory history for a session."""
    SessionMemoryManager.clear_session(conversation_id)
    return {"message": f"Session history for conversation_id='{conversation_id}' has been cleared."}


@router.get("/reports/download/{filename}", tags=["Reports"])
async def download_report_endpoint(filename: str):
    """Download generated PowerPoint sales presentation or analytics report file."""
    from fastapi.responses import FileResponse
    from src.config.settings import settings
    file_path = settings.BASE_DIR / "storage" / "reports" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Requested report file not found.")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
