import os
from pathlib import Path
from typing import Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Identity & Environment
    APP_NAME: str = "SupportIQ"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Path Configurations
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR / "NovaCart_SupportIQ_Knowledge_Base" / "novacart_knowledge_base"
    CHROMA_PERSIST_DIR: Path = BASE_DIR / "storage" / "chromadb"
    
    # Relational Database Configuration (PostgreSQL or SQLite fallback)
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'storage' / 'novacart.db'}"
    
    # JWT Security Configuration
    JWT_SECRET_KEY: str = "novacart-super-secret-production-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Zero-Cost & Low-Storage LLM Provider ("google", "groq", or "ollama")
    LLM_PROVIDER: str = "google"
    
    # Free API Keys (Zero Local Disk Overhead)
    GOOGLE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    SERPER_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    
    # Default Model Names (100% Free Tiers)
    DEFAULT_MODEL_NAME: str = "gemini-3.6-flash"
    
    # Ultra-Lightweight Free Embedding Model (~90MB local download, CPU fast)
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Vector Search Parameters
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    TOP_K_RESULTS: int = 4
    SIMILARITY_THRESHOLD: float = 0.65
    
    # Security & Ownership Enforcement
    ENFORCE_ORDER_OWNERSHIP: bool = True
    
    model_config = ConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
