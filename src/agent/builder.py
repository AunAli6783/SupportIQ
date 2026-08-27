from typing import List, Any
try:
    from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
except ImportError:
    from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama

from src.config.settings import settings
from src.agent.prompts import SYSTEM_PROMPT_TEMPLATE
from src.tools.order_tool import get_order_status
from src.tools.product_tool import search_products
from src.tools.calculator_tool import calculate
from src.tools.knowledge_tool import search_knowledge_base
from src.tools.escalation_tool import escalate_to_human
from src.utils.logger import logger

def get_llm_model():
    """
    Factory to instantiate configured 100% Free / Zero-Cost LLM provider.
    - Google Gemini (Free API Key via Google AI Studio, 0 MB disk footprint)
    - Groq (Free API Key via Groq Cloud, 0 MB disk footprint)
    - Ollama (Local micro model < 1.3 GB disk footprint)
    """
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "google":
        return ChatGoogleGenerativeAI(
            model=settings.DEFAULT_MODEL_NAME or "gemini-3.6-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.0
        )
    elif provider == "groq":
        return ChatGroq(
            model=settings.DEFAULT_MODEL_NAME or "llama-3.1-8b-instant",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.0
        )
    elif provider == "ollama":
        return ChatOllama(
            model=settings.DEFAULT_MODEL_NAME or "llama3.2:1b",
            temperature=0.0
        )
    else:
        # Default fallback to Google Gemini Free Tier
        return ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.0
        )

def create_support_agent() -> AgentExecutor:
    """Build and return configured Tool Calling Agent Executor."""
    tools = [
        get_order_status,
        search_products,
        calculate,
        search_knowledge_base,
        escalate_to_human
    ]

    llm = get_llm_model()

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT_TEMPLATE),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])

    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)
    
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        max_iterations=5,
        handle_parsing_errors=True,
        return_intermediate_steps=True
    )

    logger.info("Successfully constructed SupportIQ Tool Calling Agent Executor.")
    return agent_executor
