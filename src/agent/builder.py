import os
from typing import List, Any, Optional
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
from src.tools.internet_tool import search_internet
from src.tools.analytics_tool import get_sales_statistics
from src.tools.ppt_tool import create_sales_presentation
from src.utils.logger import logger

def get_llm_model(provider: Optional[str] = None, model_name: Optional[str] = None):
    """
    Factory to instantiate configured 100% Free / Zero-Cost LLM provider.
    - Google Gemini (Free API Key via Google AI Studio, 0 MB disk footprint)
    - Groq (Free API Key via Groq Cloud, 0 MB disk footprint)
    - Ollama (Local micro model < 1.3 GB disk footprint)
    """
    if settings.GOOGLE_API_KEY:
        os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
    if settings.GROQ_API_KEY:
        os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY

    target_provider = (provider or settings.LLM_PROVIDER).lower()
    target_model = model_name or settings.DEFAULT_MODEL_NAME

    if target_provider == "google":
        return ChatGoogleGenerativeAI(
            model=target_model if "gemini" in target_model else "gemini-3.6-flash",
            api_key=settings.GOOGLE_API_KEY,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.35
        )
    elif target_provider == "groq":
        return ChatGroq(
            model=target_model if target_model and "gemini" not in target_model else "openai/gpt-oss-20b",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.35
        )
    elif target_provider == "ollama":
        return ChatOllama(
            model=target_model or "llama3.2:1b",
            temperature=0.35
        )
    else:
        # Default fallback to Google Gemini Free Tier
        return ChatGoogleGenerativeAI(
            model="gemini-3.6-flash",
            api_key=settings.GOOGLE_API_KEY,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.35
        )

def create_support_agent(provider: Optional[str] = None, model_name: Optional[str] = None) -> AgentExecutor:
    """Build and return configured Tool Calling Agent Executor with loop prevention."""
    tools = [
        get_order_status,
        search_products,
        calculate,
        search_knowledge_base,
        escalate_to_human,
        search_internet,
        get_sales_statistics,
        create_sales_presentation
    ]

    llm = get_llm_model(provider=provider, model_name=model_name)

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
        max_iterations=4,
        early_stopping_method="generate",
        handle_parsing_errors=True,
        return_intermediate_steps=True
    )

    logger.info(f"Successfully constructed SupportIQ Tool Calling Agent ({provider or settings.LLM_PROVIDER} : {model_name or settings.DEFAULT_MODEL_NAME}).")
    return agent_executor
