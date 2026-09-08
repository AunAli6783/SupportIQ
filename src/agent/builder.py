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
from src.tools.order_tool import get_order_status, list_customer_orders
from src.tools.product_tool import search_products
from src.tools.inventory_tool import check_inventory
from src.tools.action_tool import cancel_order, request_order_return, update_shipping_address
from src.tools.calculator_tool import calculate
from src.tools.knowledge_tool import search_knowledge_base
from src.tools.escalation_tool import escalate_to_human
from src.tools.internet_tool import search_internet
from src.tools.analytics_tool import get_sales_statistics
from src.tools.ppt_tool import create_sales_presentation
from src.tools.cart_tool import add_to_cart, remove_from_cart, get_customer_cart
from src.utils.logger import logger

_AGENT_CACHE: dict = {}

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
            temperature=0.35,
            max_retries=2,
            timeout=60
        )
    elif target_provider == "groq":
        return ChatGroq(
            model=target_model if target_model and "gemini" not in target_model else "openai/gpt-oss-20b",
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.35,
            max_retries=0,
            timeout=15
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
            temperature=0.35,
            max_retries=2,
            timeout=60
        )

def get_support_tools():
    """Return configured list of autonomous agent tools."""
    return [
        get_order_status,
        list_customer_orders,
        search_products,
        check_inventory,
        cancel_order,
        request_order_return,
        update_shipping_address,
        calculate,
        search_knowledge_base,
        escalate_to_human,
        search_internet,
        get_sales_statistics,
        create_sales_presentation,
        add_to_cart,
        remove_from_cart,
        get_customer_cart
    ]

def create_support_agent(
    provider: Optional[str] = None, 
    model_name: Optional[str] = None,
    page_context_str: Optional[str] = None
) -> AgentExecutor:
    """
    Build and return configured Tool Calling Agent Executor.
    Uses in-memory cached instance to eliminate compilation and schema reflection delays.
    """
    target_provider = (provider or settings.LLM_PROVIDER).lower()
    target_model = model_name or settings.DEFAULT_MODEL_NAME
    cache_key = (target_provider, target_model)

    if cache_key in _AGENT_CACHE:
        return _AGENT_CACHE[cache_key]

    tools = get_support_tools()
    llm = get_llm_model(provider=target_provider, model_name=target_model)

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
        verbose=False,
        max_iterations=4,
        early_stopping_method="generate",
        handle_parsing_errors=True,
        return_intermediate_steps=True
    )

    _AGENT_CACHE[cache_key] = agent_executor
    logger.info(f"Successfully constructed & cached SupportIQ Tool Calling Agent ({target_provider} : {target_model}) with {len(tools)} tools.")
    return agent_executor

def prewarm_agents():
    """Pre-warm default agent during startup to ensure sub-second first-message latency."""
    try:
        logger.info("Pre-warming SupportIQ agent executor in memory...")
        create_support_agent(provider=settings.LLM_PROVIDER, model_name=settings.DEFAULT_MODEL_NAME)
        # Also pre-warm groq if key exists
        if settings.GROQ_API_KEY:
            create_support_agent(provider="groq", model_name="openai/gpt-oss-20b")
        logger.info("SupportIQ agent executor pre-warmed successfully.")
    except Exception as e:
        logger.warning(f"Agent pre-warming warning: {e}")
