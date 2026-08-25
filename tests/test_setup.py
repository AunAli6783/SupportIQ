import os
from pathlib import Path
from src.config.settings import settings
from src.utils.logger import logger
from src.utils.exceptions import SupportIQException, ConfigurationError

def test_settings_initialization():
    """Verify that settings correctly loads default parameters."""
    assert settings.APP_NAME == "SupportIQ"
    assert settings.LLM_PROVIDER in ["google", "groq", "ollama"]
    assert settings.EMBEDDING_MODEL_NAME == "sentence-transformers/all-MiniLM-L6-v2"
    logger.info(f"Verified settings app name: {settings.APP_NAME}")

def test_knowledge_base_path_exists():
    """Verify that knowledge base path points to valid existing dataset directory."""
    assert settings.KNOWLEDGE_BASE_DIR.exists(), f"Knowledge Base Directory missing at {settings.KNOWLEDGE_BASE_DIR}"
    assert settings.KNOWLEDGE_BASE_DIR.is_dir()
    logger.info(f"Verified Knowledge Base path exists at {settings.KNOWLEDGE_BASE_DIR}")

def test_chroma_storage_directory_creatable():
    """Verify that the storage directory for ChromaDB can be created."""
    settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
    assert settings.CHROMA_PERSIST_DIR.exists()
    logger.info(f"Verified Chroma storage directory at {settings.CHROMA_PERSIST_DIR}")

def test_custom_exception_hierarchy():
    """Verify custom exception inheritance."""
    err = ConfigurationError("Test config error")
    assert isinstance(err, SupportIQException)
