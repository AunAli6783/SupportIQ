import pytest
from pathlib import Path
from src.config.settings import settings
from src.ingestion.loader import MarkdownIngestor
from src.ingestion.vectorstore import VectorStoreManager

def test_markdown_ingestor_loads_and_splits():
    """Verify that Markdown files are loaded, metadata attached, and text split into chunks."""
    ingestor = MarkdownIngestor(chunk_size=300, chunk_overlap=50)
    chunks = ingestor.load_and_split(settings.KNOWLEDGE_BASE_DIR)
    
    assert len(chunks) > 0, "Ingestion produced 0 document chunks."
    first_chunk = chunks[0]
    assert "source" in first_chunk.metadata
    assert "category" in first_chunk.metadata
    assert "department" in first_chunk.metadata
    assert "chunk_id" in first_chunk.metadata

def test_vectorstore_build_and_similarity_query():
    """Verify that document chunks are embedded and searchable via vector similarity search."""
    ingestor = MarkdownIngestor(chunk_size=500, chunk_overlap=100)
    docs = ingestor.load_and_split(settings.KNOWLEDGE_BASE_DIR)
    
    vec_manager = VectorStoreManager()
    vectorstore = vec_manager.build_vectorstore(docs)
    
    # Query vector store for return policy details
    results = vectorstore.similarity_search("return policy days", k=2)
    assert len(results) > 0, "Vector search returned no results."
    
    sources = [res.metadata.get("source") for res in results]
    assert any("return_policy.md" in src for src in sources), f"Expected return_policy.md in sources, got {sources}"
