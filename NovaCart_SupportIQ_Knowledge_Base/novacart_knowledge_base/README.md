# NovaCart — AI Customer Support RAG Dataset

This synthetic dataset is designed for a LangChain + RAG + Tools learning project.

## Recommended pipeline

Documents
→ Document Loaders
→ Metadata
→ Text Splitter
→ Embeddings
→ Chroma/Qdrant
→ Retriever
→ Prompt Template
→ LLM
→ Structured Output
→ Tools / Final Response

## Suggested tools

- search_knowledge_base(query)
- get_order_status(order_id)
- search_products(query)
- calculate(expression)
- escalate_to_human(issue)

## Important project rules

1. Company-specific claims should be grounded in the knowledge base.
2. Real-time order information should come from the order tool.
3. Real-time product stock should come from the product/inventory tool.
4. Arithmetic should use the calculator tool.
5. Sensitive or unsupported cases should be escalated.
6. Never expose another customer's private order information.
7. Do not treat static catalog stock as guaranteed real-time inventory.

## Note

The documents and data in this package are fictional and created for educational/project-development purposes. They are not real NovaCart customer or company records.
