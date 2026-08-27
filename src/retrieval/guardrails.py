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
