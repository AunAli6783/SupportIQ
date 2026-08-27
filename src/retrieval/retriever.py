from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from src.ingestion.vectorstore import VectorStoreManager
from src.config.settings import settings
from src.utils.logger import logger

class SupportIQRetriever:
    def __init__(self, vectorstore: Optional[Any] = None):
        if vectorstore:
            self.vectorstore = vectorstore
        else:
            self.vectorstore = VectorStoreManager().load_vectorstore()

    def get_relevant_documents(
        self, 
        query: str, 
        search_type: str = "mmr",
        k: Optional[int] = None,
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
