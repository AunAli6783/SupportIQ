from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from src.config.settings import settings
from src.utils.logger import logger

# Singleton cached vector store and embeddings instance to avoid re-initializing PyTorch on every tool call
_CACHED_VECTORSTORE: Optional[Chroma] = None
_CACHED_EMBEDDINGS: Optional[HuggingFaceEmbeddings] = None

class VectorStoreManager:
    def __init__(self):
        global _CACHED_EMBEDDINGS
        if _CACHED_EMBEDDINGS is None:
            logger.info(f"Loading embedding model: '{settings.EMBEDDING_MODEL_NAME}'")
            _CACHED_EMBEDDINGS = HuggingFaceEmbeddings(
                model_name=settings.EMBEDDING_MODEL_NAME
            )
        self.embeddings = _CACHED_EMBEDDINGS
        self.persist_directory = str(settings.CHROMA_PERSIST_DIR)
        self.collection_name = "novacart_support_kb"

    def build_vectorstore(self, documents: List[Document]) -> Chroma:
        """Create or overwrite ChromaDB vector collection from document chunks and persist to disk."""
        global _CACHED_VECTORSTORE
        logger.info(f"Initializing ChromaDB vector store at '{self.persist_directory}'")
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_name=self.collection_name
        )
        _CACHED_VECTORSTORE = vectorstore
        logger.info(f"ChromaDB vector store successfully created with {len(documents)} document chunks.")
        return vectorstore

    def load_vectorstore(self) -> Chroma:
        """Load an existing persisted ChromaDB vector collection (uses in-memory cached instance if ready)."""
        global _CACHED_VECTORSTORE
        if _CACHED_VECTORSTORE is not None:
            return _CACHED_VECTORSTORE

        logger.info(f"Loading ChromaDB vector store from disk at '{self.persist_directory}'")
        _CACHED_VECTORSTORE = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name=self.collection_name
        )
        return _CACHED_VECTORSTORE
