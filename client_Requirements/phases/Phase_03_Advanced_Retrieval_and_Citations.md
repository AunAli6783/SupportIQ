# Phase 03: Advanced Retrieval and Source Citation Engine

> **Phase Status:** Planned  
> **Prerequisites:** Phase 02 Completed (ChromaDB vector store indexed)  
> **Target Outcome:** High-precision search abstraction featuring Maximal Marginal Relevance (MMR), dynamic metadata filtering, citation generation, confidence evaluation, and anti-hallucination guardrails.

---

## 1. Objective

Upgrade basic vector retrieval to an advanced context retriever that prevents redundancy through MMR, dynamically filters documents by department/category, generates exact source citations, and protects against LLM hallucinations when knowledge base coverage is missing.

---

## 2. Advanced Retrieval Architecture

```
                          Customer Question
                                  │
                                  ▼
                     ┌───────────────────────────┐
                     │   Query Preprocessor /    │
                     │    Metadata Extractor     │
                     └────────────┬──────────────┘
                                  │ (Query + Metadata Filters)
                                  ▼
                     ┌───────────────────────────┐
                     │ Maximal Marginal Relevance│  (fetch_k=20, k=4, lambda=0.7)
                     │     (MMR Retriever)       │
                     └────────────┬──────────────┘
                                  │ (Top K Relevant Chunks)
                                  ▼
                     ┌───────────────────────────┐
                     │   Confidence Evaluator    │  Checks similarity score threshold
                     └────────────┬──────────────┘
                                  ├──────────────────────────────┐
                     (Confidence ≥ 0.65)                         │ (Confidence < 0.65)
                                  ▼                              ▼
                     ┌───────────────────────────┐  ┌───────────────────────────┐
                     │ Citation Builder & Context│  │ Fallback Signal:          │
                     │    Formatter Engine       │  │ "Information Not Found"   │
                     └────────────┬──────────────┘  └───────────────────────────┘
                                  │
                                  ▼
                        LLM Prompt Injection
```

---

## 3. Implementation Components

### Step 3.1: SupportIQ Retriever Abstraction (`src/retrieval/retriever.py`)
Implement the central retrieval engine exposing similarity search, MMR search, and filtered queries.

```python
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from src.ingestion.vectorstore import VectorStoreManager
from src.config.settings import settings
from src.utils.logger import logger

class SupportIQRetriever:
    def __init__(self, vectorstore: Optional[Chroma] = None):
        if vectorstore:
            self.vectorstore = vectorstore
        else:
            self.vectorstore = VectorStoreManager().load_vectorstore()

    def get_relevant_documents(
        self, 
        query: str, 
        search_type: str = "mmr",
        k: int = None,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """
        Retrieve relevant context documents using standard similarity or MMR diversity search.
        """
        k = k or settings.TOP_K_RESULTS
        logger.info(f"Retrieving docs for query='{query}', type='{search_type}', filter={metadata_filter}")

        if search_type == "mmr":
            results = self.vectorstore.max_marginal_relevance_search(
                query=query,
                k=k,
                fetch_k=20,
                lambda_mult=0.7,
                filter=metadata_filter
            )
        else:
            results = self.vectorstore.similarity_search(
                query=query,
                k=k,
                filter=metadata_filter
            )

        logger.debug(f"Retrieved {len(results)} chunks from vector store.")
        return results
```

### Step 3.2: Source Citation Builder (`src/retrieval/citations.py`)
Extract chunk metadata to construct user-facing markdown citations and structured references.

```python
from typing import List, Dict, Tuple
from langchain_core.documents import Document

class CitationEngine:
    @staticmethod
    def format_sources(documents: List[Document]) -> Tuple[str, List[Dict[str, str]]]:
        """
        Format retrieved document objects into:
        1. Injectable prompt context block with source tags.
        2. Structured source attribution list for response payload.
        """
        context_parts = []
        structured_sources = []
        seen = set()

        for idx, doc in enumerate(documents, 1):
            source_file = doc.metadata.get("source", "Unknown Document")
            category = doc.metadata.get("category", "General")
            department = doc.metadata.get("department", "Support")
            
            # Format context block for LLM
            context_parts.append(
                f"--- DOCUMENT CHUNK {idx} [Source: {source_file} | Category: {category}] ---\n"
                f"{doc.page_content.strip()}\n"
            )

            # Avoid duplicate citations in final user response
            citation_key = f"{source_file}"
            if citation_key not in seen:
                seen.add(citation_key)
                structured_sources.append({
                    "source": source_file,
                    "category": category,
                    "department": department
                })

        formatted_context = "\n".join(context_parts)
        return formatted_context, structured_sources
```

### Step 3.3: Grounding & Anti-Hallucination Guard (`src/retrieval/guardrails.py`)
Evaluate retrieved text relevance and generate explicit fallback responses when knowledge base documents do not contain the answer.

```python
from typing import List, Tuple
from langchain_core.documents import Document
from src.config.settings import settings
from src.utils.logger import logger

UNGROUNDED_FALLBACK = (
    "I couldn't find this information in NovaCart's official knowledge base. "
    "Please contact NovaCart support if you need further assistance."
)

class GroundingGuard:
    @staticmethod
    def validate_retrieval_relevance(
        documents: List[Document], 
        min_chunks: int = 1
    ) -> Tuple[bool, str]:
        """
        Verify if the retrieved documents provide adequate grounding material.
        Returns (is_valid, reason).
        """
        if not documents or len(documents) < min_chunks:
            logger.warning("Retrieval returned empty or insufficient document chunks.")
            return False, "Insufficient knowledge base coverage."

        # Check total character length of context
        total_len = sum(len(doc.page_content) for doc in documents)
        if total_len < 50:
            logger.warning(f"Retrieved context too short ({total_len} chars). Triggering fallback.")
            return False, "Context length below relevance threshold."

        return True, "Valid context"
```

---

## 4. Verification & Test Plan

Create `tests/test_retrieval.py` to test MMR search diversity, source formatting, and low-confidence fallback behavior.

```python
import pytest
from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.retrieval.guardrails import GroundingGuard, UNGROUNDED_FALLBACK

def test_mmr_retrieval_returns_results():
    retriever = SupportIQRetriever()
    docs = retriever.get_relevant_documents("warranty period for laptops", search_type="mmr")
    assert len(docs) > 0
    assert any("warranty" in doc.page_content.lower() for doc in docs)

def test_citation_formatting():
    retriever = SupportIQRetriever()
    docs = retriever.get_relevant_documents("shipping policy delivery time", k=2)
    context_str, sources = CitationEngine.format_sources(docs)
    
    assert "DOCUMENT CHUNK 1" in context_str
    assert len(sources) > 0
    assert "source" in sources[0]

def test_grounding_guard_empty():
    is_valid, msg = GroundingGuard.validate_retrieval_relevance([])
    assert is_valid is False
    assert "Insufficient" in msg
```

---

## 5. Phase 03 Checklist

- [ ] Implement `src/retrieval/retriever.py` with similarity & MMR search.
- [ ] Implement `src/retrieval/citations.py` for context formatting and structured source lists.
- [ ] Implement `src/retrieval/guardrails.py` for anti-hallucination validation.
- [ ] Execute `pytest tests/test_retrieval.py` to confirm citation formatting and MMR retrieval accuracy.
