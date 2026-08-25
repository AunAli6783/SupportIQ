from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
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
        """
        Recursively scan directory for .md files, attach metadata, and split into chunks.
        """
        documents = []
        md_files = list(knowledge_base_dir.rglob("*.md"))
        logger.info(f"Discovered {len(md_files)} Markdown files in {knowledge_base_dir}")

        for file_path in md_files:
            # Skip README files inside dataset directories
            if file_path.name.upper() == "README.MD":
                continue

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                base_meta = extract_file_metadata(file_path)
                
                # Create raw document object and split into contextual chunks
                raw_doc = Document(page_content=content, metadata=base_meta)
                chunks = self.splitter.split_documents([raw_doc])

                # Annotate unique chunk IDs and index tracking
                for idx, chunk in enumerate(chunks):
                    chunk.metadata["chunk_id"] = f"{file_path.stem}_chunk_{idx}"
                    chunk.metadata["chunk_index"] = idx

                documents.extend(chunks)
                logger.debug(f"Loaded {len(chunks)} chunks from {file_path.name}")

            except Exception as e:
                logger.error(f"Failed to ingest document {file_path}: {str(e)}")

        logger.info(f"Total chunks created across all documents: {len(documents)}")
        return documents
