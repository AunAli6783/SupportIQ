from typing import Dict, List
try:
    from langchain_core.chat_history import InMemoryChatMessageHistory as ChatMessageHistory
except ImportError:
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
    def get_messages(cls, conversation_id: str, limit: int = 6) -> List[BaseMessage]:
        """Get message history list for agent prompt injection (limited to last `limit` messages to prevent token bloat)."""
        all_msgs = list(cls.get_history(conversation_id).messages)
        return all_msgs[-limit:] if limit > 0 else all_msgs

    @classmethod
    def add_user_message(cls, conversation_id: str, message: str):
        """Append user input to session history."""
        cls.get_history(conversation_id).add_user_message(message)

    @classmethod
    def add_ai_message(cls, conversation_id: str, message: str):
        """Append AI response to session history."""
        cls.get_history(conversation_id).add_ai_message(message)

    @classmethod
    def get_formatted_history(cls, conversation_id: str) -> List[Dict[str, str]]:
        """Get formatted list of message dicts for frontend rendering."""
        msgs = cls.get_messages(conversation_id)
        formatted = []
        for msg in msgs:
            role = "user" if msg.type in ["human", "user"] else "assistant"
            formatted.append({"role": role, "content": msg.content})
        return formatted

    @classmethod
    def clear_session(cls, conversation_id: str):
        """Purge conversation session."""
        if conversation_id in cls._sessions:
            del cls._sessions[conversation_id]
            logger.info(f"Cleared session history for conversation_id='{conversation_id}'")
