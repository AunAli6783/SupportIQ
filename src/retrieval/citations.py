from typing import List, Dict, Tuple
from langchain_core.documents import Document

class CitationEngine:
    @staticmethod
    def format_sources(documents: List[Document]) -> Tuple[str, List[Dict[str, str]]]:
        """
        Format retrieved document objects into:
        1. Injectable prompt context block with source tags for the LLM.
        2. Structured source attribution list for response payload.
        """
        context_parts = []
        structured_sources = []
        seen = set()

        for idx, doc in enumerate(documents, 1):
            source_file = doc.metadata.get("source", "Unknown Document")
            category = doc.metadata.get("category", "General")
            department = doc.metadata.get("department", "Support")
            
            # Format context block for LLM prompt injection
            context_parts.append(
                f"--- DOCUMENT CHUNK {idx} [Source: {source_file} | Category: {category}] ---\n"
                f"{doc.page_content.strip()}\n"
            )

            # Avoid duplicate citations in final user response payload
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
