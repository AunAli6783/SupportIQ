import pytest
from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.retrieval.guardrails import GroundingGuard, UNGROUNDED_FALLBACK

def test_mmr_retrieval_returns_results():
    """Verify MMR search returns diverse relevant policy chunks."""
    retriever = SupportIQRetriever()
    docs = retriever.get_relevant_documents("warranty period for laptops", search_type="mmr")
    assert len(docs) > 0
    assert any("warranty" in doc.page_content.lower() for doc in docs)

def test_citation_formatting():
    """Verify context formatting and structured source list generation."""
    retriever = SupportIQRetriever()
    docs = retriever.get_relevant_documents("shipping policy delivery time", k=2)
    context_str, sources = CitationEngine.format_sources(docs)
    
    assert "DOCUMENT CHUNK 1" in context_str
    assert len(sources) > 0
    assert "source" in sources[0]

def test_grounding_guard_empty():
    """Verify anti-hallucination guard catches empty retrieval."""
    is_valid, msg = GroundingGuard.validate_retrieval_relevance([])
    assert is_valid is False
    assert "Insufficient" in msg
