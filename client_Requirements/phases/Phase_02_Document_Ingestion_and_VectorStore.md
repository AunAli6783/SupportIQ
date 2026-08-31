# Phase 02: Document Ingestion and VectorStore Pipeline

> **Phase Status:** Planned  
> **Prerequisites:** Phase 01 Completed (`src/config/settings.py` operational)  
> **Target Outcome:** Automated document ingestion pipeline that recursively parses NovaCart Markdown documentation, extracts rich metadata, chunks content, generates embeddings, and persists them into ChromaDB.

---

## 1. Objective

Build an ingestion engine capable of reading NovaCart's knowledge base (`policies/`, `company/`, `faq/`, `products/`), parsing headers to extract semantic metadata, splitting text into contextual chunks, and indexing them into a persistent vector store.

---

## 2. Ingestion Architecture Flowchart

```
┌─────────────────────────┐
│ Knowledge Base Files    │  (policies/*.md, company/*.md, faq/*.md, products/*.md)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Custom Markdown Loader  │  Extract raw text & metadata (source, category, section)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Metadata Extractor      │  Attach department, doc_type, file_name, section title
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Text Chunking Engine    │  RecursiveCharacterTextSplitter (chunk_size=500, overlap=100)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Embedding Generator     │  SentenceTransformers (all-MiniLM-L6-v2) or Gemini Embeddings
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ ChromaDB VectorStore    │  Persist to storage/chromadb/
└─────────────────────────┘
```

---

## 3. Implementation Components

### Step 2.1: Metadata Mapping Schema (`src/ingestion/metadata.py`)
Define structural rules for extracting categorical metadata from document paths and Markdown headers.

```python
from pathlib import Path
from typing import Dict, Any

CATEGORY_MAP = {
    "policies": "policy",
    "company": "company_info",
    "faq": "faq",
    "products": "product_manual"
}

DEPARTMENT_MAP = {
    "return_policy.md": "customer_support",
    "refund_policy.md": "finance",
    "shipping_policy.md": "logistics",
    "warranty_policy.md": "technical_support",
    "payment_policy.md": "finance",
    "cancellation_policy.md": "customer_support",
    "privacy_policy.md": "legal",
    "terms_conditions.md": "legal",
    "customer_faq.md": "general_support",
    "laptops.md": "product_catalog",
    "smartphones.md": "product_catalog",
    "accessories.md": "product_catalog"
}

def extract_file_metadata(file_path: Path) -> Dict[str, Any]:
    """Extract metadata attributes based on file location and name."""
    relative_parent = file_path.parent.name
    file_name = file_path.name
    
    return {
        "source": file_name,
        "relative_path": str(file_path),
        "category": CATEGORY_MAP.get(relative_parent, "general"),
        "department": DEPARTMENT_MAP.get(file_name, "customer_service"),
        "document_type": "markdown"
    }
```

### Step 2.2: Document Loader & Splitter (`src/ingestion/loader.py`)
Implement the loader to process Markdown files, preserve section headings, and produce split `Document` objects with metadata attached.

```python
from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from src.ingestion.metadata import extract_file_metadata
from src.utils.logger import logger

class MarkdownIngestor:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""]
        )

    def load_and_split(self, knowledge_base_dir: Path) -> List[Document]:
        """Recursively scan directory for .md files, attach metadata, and split into chunks."""
        documents = []
        md_files = list(knowledge_base_dir.rglob("*.md"))
        logger.info(f"Discovered {len(md_files)} Markdown files in {knowledge_base_dir}")

        for file_path in md_files:
            if file_path.name.upper() == "README.MD":
                continue # Skip dataset README files

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                base_meta = extract_file_metadata(file_path)
                
                # Split content while preserving metadata
                raw_doc = Document(page_content=content, metadata=base_meta)
                chunks = self.splitter.split_documents([raw_doc])

                # Annotate chunk IDs and section tracking
                for idx, chunk in enumerate(chunks):
                    chunk.metadata["chunk_id"] = f"{file_path.stem}_chunk_{idx}"
                    chunk.metadata["chunk_index"] = idx

                documents.extend(chunks)
                logger.debug(f"Loaded {len(chunks)} chunks from {file_path.name}")

            except Exception as e:
                logger.error(f"Failed to ingest document {file_path}: {str(e)}")

        logger.info(f"Total chunks created across all documents: {len(documents)}")
        return documents
```

### Step 2.3: Vector Database Manager (`src/ingestion/vectorstore.py`)
Encapsulate ChromaDB connection, collection lifecycle, and embedding initialization.

```python
from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from src.config.settings import settings
from src.utils.logger import logger

class VectorStoreManager:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL_NAME
        )
        self.persist_directory = str(settings.CHROMA_PERSIST_DIR)

    def build_vectorstore(self, documents: List[Document]) -> Chroma:
        """Create or overwrite ChromaDB vector collection from document chunks."""
        logger.info(f"Initializing ChromaDB vector store at {self.persist_directory}")
        
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_name="novacart_support_kb"
        )
        vectorstore.persist()
        logger.info("ChromaDB vector store successfully created and persisted.")
        return vectorstore

    def load_vectorstore(self) -> Chroma:
        """Load an existing persisted ChromaDB vector collection."""
        return Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="novacart_support_kb"
        )
```

### Step 2.4: Executable Ingestion Script (`src/ingestion/ingest.py`)
Standalone CLI script to execute full ingestion pipeline.

```python
import sys
from src.config.settings import settings
from src.ingestion.loader import MarkdownIngestor
from src.ingestion.vectorstore import VectorStoreManager
from src.utils.logger import logger

def run_ingestion():
    logger.info("Starting NovaCart SupportIQ Ingestion Pipeline...")
    
    ingestor = MarkdownIngestor(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP
    )
    
    docs = ingestor.load_and_split(settings.KNOWLEDGE_BASE_DIR)
    if not docs:
        logger.error("No documents found to ingest!")
        sys.exit(1)

    vec_manager = VectorStoreManager()
    vec_manager.build_vectorstore(docs)
    logger.info("Ingestion Pipeline completed successfully!")

if __name__ == "__main__":
    run_ingestion()
```

---

## 4. Verification & Test Plan

Create `tests/test_ingestion.py` to validate metadata extraction and vector store query functionality.

```python
import pytest
from src.config.settings import settings
from src.ingestion.loader import MarkdownIngestor
from src.ingestion.vectorstore import VectorStoreManager

def test_markdown_loader_chunks():
    ingestor = MarkdownIngestor(chunk_size=300, chunk_overlap=50)
    chunks = ingestor.load_and_split(settings.KNOWLEDGE_BASE_DIR)
    
    assert len(chunks) > 0, "Ingestion produced 0 chunks."
    first_chunk = chunks[0]
    assert "source" in first_chunk.metadata
    assert "category" in first_chunk.metadata
    assert "department" in first_chunk.metadata

def test_vectorstore_similarity_search():
    vec_manager = VectorStoreManager()
    vectorstore = vec_manager.load_vectorstore()
    
    results = vectorstore.similarity_search("return policy days", k=2)
    assert len(results) > 0
    assert "return_policy.md" in [res.metadata.get("source") for res in results]
```

---

## 5. Phase 02 Checklist

- [ ] Implement `src/ingestion/metadata.py` with NovaCart metadata mappings.
- [ ] Implement `src/ingestion/loader.py` for chunk splitting.
- [ ] Implement `src/ingestion/vectorstore.py` using ChromaDB.
- [ ] Run `python -m src.ingestion.ingest` and verify Chroma vector index generation.
- [ ] Execute `pytest tests/test_ingestion.py` to confirm document chunk retrieval.
