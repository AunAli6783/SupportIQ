from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from src.config.settings import settings
from src.utils.logger import logger

class VectorStoreManager:
    def __init__(self):
        logger.info(f"Loading embedding model: '{settings.EMBEDDING_MODEL_NAME}'")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL_NAME
        )
        self.persist_directory = str(settings.CHROMA_PERSIST_DIR)
        self.collection_name = "novacart_support_kb"

    def build_vectorstore(self, documents: List[Document]) -> Chroma:
        """
        Create or overwrite ChromaDB vector collection from document chunks and persist to disk.
        """
        logger.info(f"Initializing ChromaDB vector store at '{self.persist_directory}'")
        
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_name=self.collection_name
        )
        logger.info(f"ChromaDB vector store successfully created with {len(documents)} document chunks.")
        return vectorstore

    def load_vectorstore(self) -> Chroma:
        """
        Load an existing persisted ChromaDB vector collection from storage directory.
        """
        logger.info(f"Loading ChromaDB vector store from '{self.persist_directory}'")
        return Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name=self.collection_name
        )
