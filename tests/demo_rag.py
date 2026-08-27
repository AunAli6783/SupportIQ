import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.retrieval.retriever import SupportIQRetriever
from src.retrieval.citations import CitationEngine
from src.retrieval.guardrails import GroundingGuard, UNGROUNDED_FALLBACK

def run_rag_demo():
    print("==================================================")
    print("   SupportIQ RAG Pipeline Interactive Demo (Phase 1-3)")
    print("==================================================\n")

    retriever = SupportIQRetriever()
    
    sample_queries = [
        "What is NovaCart's return policy for unopened items?",
        "Does accidental damage fall under laptop warranty?",
        "How long does standard delivery take?",
        "What is the policy for returning activated software?"
    ]

    for idx, query in enumerate(sample_queries, 1):
        print(f"--- TEST QUERY #{idx}: '{query}' ---")
        
        # 1. Retrieve via MMR
        docs = retriever.get_relevant_documents(query=query, search_type="mmr", k=2)
        
        # 2. Grounding Guard Check
        is_valid, reason = GroundingGuard.validate_retrieval_relevance(docs)
        if not is_valid:
            print(f"Grounding Guard: {reason}")
            print(f"Fallback Response: {UNGROUNDED_FALLBACK}\n")
            continue
            
        # 3. Format Citations
        context_str, sources = CitationEngine.format_sources(docs)
        
        print("Retrieved Sources:", [s["source"] for s in sources])
        print("Formatted Context Preview:")
        print(context_str[:250] + "...\n")
        print("-" * 60 + "\n")

if __name__ == "__main__":
    run_rag_demo()
