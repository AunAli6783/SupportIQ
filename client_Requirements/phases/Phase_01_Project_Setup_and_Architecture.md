# Phase 01: Project Setup and System Foundation

> **Phase Status:** Planned  
> **Prerequisites:** Python 3.10+, Virtual Environment created  
> **Target Outcome:** Operational code repository structure, validated configuration management, centralized logging, and environment dependency verification.

---

## 1. Objective

Establish the core application infrastructure, dependency baseline, environment variable configuration framework, logging module, and exception hierarchy for SupportIQ.

---


## 2. Directory Layout & Module Structure

The project will follow a modular Python layout designed for clean separation of concerns:

```
SupportIQ/
├── client_Requirements/
│   ├── main_Document.md
│   └── phases/
│       ├── README.md
│       ├── Phase_01_Project_Setup_and_Architecture.md
│       ├── Phase_02_Document_Ingestion_and_VectorStore.md
│       ├── Phase_03_Advanced_Retrieval_and_Citations.md
│       ├── Phase_04_Tools_Development_and_Mock_Services.md
│       ├── Phase_05_Agentic_Orchestration_and_Security.md
│       ├── Phase_06_Memory_and_Structured_Outputs.md
│       ├── Phase_07_FastAPI_Backend_and_Streaming.md
│       ├── Phase_08_Frontend_UI_and_User_Experience.md
│       └── Phase_09_Evaluation_Testing_and_Benchmarking.md
│
├── NovaCart_SupportIQ_Knowledge_Base/
│   └── novacart_knowledge_base/       # Direct source dataset
│
├── src/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py               # Pydantic Settings
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py                 # Structured logging module
│   │   └── exceptions.py             # Domain exception definitions
│   ├── ingestion/                    # Phase 02
│   ├── retrieval/                    # Phase 03
│   ├── tools/                        # Phase 04
│   ├── agent/                        # Phase 05
│   ├── memory/                       # Phase 06
│   └── schemas/                      # Phase 06 Pydantic models
│
├── app/                              # Phase 07 (FastAPI Backend)
│   ├── __init__.py
│   ├── main.py
│   └── api/
│
├── frontend/                         # Phase 08 (Streamlit UI)
│   └── app.py
│
├── tests/                            # Test suite
│   ├── __init__.py
│   ├── test_setup.py
│   └── ...
│
├── storage/                          # Local Chroma DB persistence directory
│   └── chromadb/
│
├── .env.example                      # Template environment variables
├── requirements.txt                  # Python dependencies
└── README.md
```

---

## 3. Implementation Steps

### Step 1.1: Dependency Specification (`requirements.txt`)
Create `requirements.txt` containing all necessary packages pinned to stable versions:

```text
# Core LangChain & Free LLM Integrations
langchain>=0.1.0
langchain-community>=0.0.20
langchain-core>=0.1.20
langchain-google-genai>=1.0.0
langchain-groq>=0.1.0
langchain-ollama>=0.1.0

# Vector Database & Ultra-Lightweight Embeddings (90MB CPU Model)
chromadb>=0.4.22
sentence-transformers>=2.2.2

# Data Processing
pandas>=2.0.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-dotenv>=1.0.0

# Safe Math Engine
numexpr>=2.8.0

# API Backend & Streaming
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sse-starlette>=1.8.2

# Frontend
streamlit>=1.31.0

# Testing & Utilities
pytest>=8.0.0
pytest-asyncio>=0.23.0
rich>=13.7.0
```

### Step 1.2: Environment Configuration Manager (`src/config/settings.py`)
Implement a strict Pydantic `BaseSettings` class to validate configuration parameters upon startup (defaults to free Gemini / Groq cloud APIs with zero disk overhead, or local Ollama micro models).

```python
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "SupportIQ"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Path Configurations
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR / "NovaCart_SupportIQ_Knowledge_Base" / "novacart_knowledge_base"
    CHROMA_PERSIST_DIR: Path = BASE_DIR / "storage" / "chromadb"
    
    # Free & Zero-Storage LLM Settings
    # Options: "google" (Gemini 100% Free API), "groq" (Groq 100% Free API), "ollama" (Local micro-model < 1.3GB)
    LLM_PROVIDER: str = "google" 
    
    # Free API Keys (Zero Local Disk Footprint)
    GOOGLE_API_KEY: Optional[str] = None # Free via Google AI Studio
    GROQ_API_KEY: Optional[str] = None   # Free via Groq Cloud
    
    # Model Names (100% Free Tiers)
    DEFAULT_MODEL_NAME: str = "gemini-1.5-flash" # or "llama-3.1-8b-instant" (Groq) or "llama3.2:1b" (Ollama)
    
    # Ultra-Lightweight Free Embedding Model (~90MB local download, CPU fast)
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Vector Search Parameters
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    TOP_K_RESULTS: int = 4
    SIMILARITY_THRESHOLD: float = 0.65
    
    # Security Controls
    ENFORCE_ORDER_OWNERSHIP: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
```

### Step 1.3: Centralized Logger (`src/utils/logger.py`)
Configure a standard logger providing formatted output for console and file logging.

```python
import sys
import logging
from src.config.settings import settings

def setup_logger(name: str = "SupportIQ") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
```

### Step 1.4: Domain Exception Hierarchy (`src/utils/exceptions.py`)
Define custom exceptions to enable targeted error handling across ingestion, retrieval, tool execution, and security verification.

```python
class SupportIQException(Exception):
    """Base exception for all SupportIQ domain errors."""
    pass

class ConfigurationError(SupportIQException):
    """Raised when environment settings or API keys are missing/invalid."""
    pass

class DocumentIngestionError(SupportIQException):
    """Raised when document parsing or embedding generation fails."""
    pass

class ToolExecutionError(SupportIQException):
    """Raised when a tool (e.g. Order status, product search) fails during execution."""
    pass

class SecurityAccessDeniedError(SupportIQException):
    """Raised when a customer attempts unauthorized access to another user's data."""
    pass

class LowConfidenceError(SupportIQException):
    """Raised when retrieval confidence falls below threshold."""
    pass
```

---

## 4. Verification & Test Plan

Create `tests/test_setup.py` to verify that environment variables, directory paths, and settings are correctly loaded.

```python
import pytest
from src.config.settings import settings
from src.utils.logger import logger

def test_settings_paths_exist():
    assert settings.KNOWLEDGE_BASE_DIR.exists(), f"Knowledge base dir missing at {settings.KNOWLEDGE_BASE_DIR}"
    logger.info(f"Verified Knowledge Base path: {settings.KNOWLEDGE_BASE_DIR}")

def test_chroma_persist_dir_creatable():
    settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
    assert settings.CHROMA_PERSIST_DIR.exists()
```

---

## 5. Phase 01 Checklist

- [ ] Create Python virtual environment and install `requirements.txt`.
- [ ] Create project folder structure (`src/`, `app/`, `frontend/`, `tests/`, `storage/`).
- [ ] Implement `src/config/settings.py` and `.env` configuration file.
- [ ] Implement `src/utils/logger.py` and `src/utils/exceptions.py`.
- [ ] Run `pytest tests/test_setup.py` to confirm path resolution and settings initialization.
