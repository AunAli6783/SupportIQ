import sys
from src.config.settings import settings
from src.ingestion.loader import MarkdownIngestor
from src.ingestion.vectorstore import VectorStoreManager
from src.utils.logger import logger

def run_ingestion():
    """
    Execute full Document Ingestion Pipeline:
    Knowledge Base Files -> MarkdownIngestor -> Chunk Splitting -> Embedding Generation -> ChromaDB Persistence.
    """
    logger.info("==================================================")
    logger.info("Starting NovaCart SupportIQ Ingestion Pipeline...")
    logger.info("==================================================")
    
    ingestor = MarkdownIngestor(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP
    )
    
    docs = ingestor.load_and_split(settings.KNOWLEDGE_BASE_DIR)
    if not docs:
        logger.error("No documents found to ingest! Check Knowledge Base path.")
        sys.exit(1)

    vec_manager = VectorStoreManager()
    vec_manager.build_vectorstore(docs)
    
    logger.info("==================================================")
    logger.info("Ingestion Pipeline Completed Successfully!")
    logger.info(f"Persisted to: {settings.CHROMA_PERSIST_DIR}")
    logger.info("==================================================")

if __name__ == "__main__":
    run_ingestion()
