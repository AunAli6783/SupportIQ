# Phase 05: Context-Aware RAG & Policy Grounding (ChromaDB + Page-Aware Retrieval)

> **Phase Status:** Planned  
> **Prerequisites:** Phase 03 & Phase 04 Completed (Widget context bridge & DB tools running)  
> **Target Outcome:** ChromaDB vector database integrated with page-aware RAG retrieval, combining official company policy documentation with live product page context to deliver grounded, accurate customer answers.

---

## 1. Objective

Maintain a strict separation between **structured database data** (orders, inventory, prices) and **unstructured official knowledge base documents** (return rules, warranty exclusions, shipping timeframes). When a customer asks a question while viewing a specific product or checkout page, SupportIQ seamlessly fuses live database specs with ChromaDB vector policy documents.

---

## 2. Dual-Engine Architecture (Database + Vector RAG)

```
                            CUSTOMER QUESTION
                  "Does this laptop have a warranty?"
                  (Active Page Context: /products/P-1001)
                                   │
                                   ▼
                           AI AGENT EXECUTOR
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
 ┌───────────────┐                                   ┌───────────────┐
 │ Product Tool  │                                   │   RAG Tool    │
 └───────┬───────┘                                   └───────┬───────┘
         │                                                   │
         ▼                                                   ▼
PostgreSQL / DB                                       ChromaDB Vector
SELECT specs->>'warranty'                             MMR Search:
FROM products                                         "warranty coverage, screen,
WHERE id = 'P-1001'                                    battery exclusions"
         │                                                   │
         │ (Result: "2-Year Official")                       │ (Result: warranty_policy.md)
         └─────────────────────────┬─────────────────────────┘
                                   ▼
                             FINAL SYNTHESIS
      "Yes, the NovaBook Pro 14 includes a 2-Year Official NovaCart
       Warranty covering hardware defects, battery, and motherboard..."
      [Source: warranty_policy.md]
```

---

## 3. Implementation Components

### Step 5.1: Knowledge Base Collection (`storage/chromadb/`)

Maintains vector embeddings for official company documentation:
* `policies/return_policy.md` (30-day window, unboxing requirements, condition rules)
* `policies/warranty_policy.md` (Duration, claim process, exclusions for accidental damage)
* `policies/shipping_policy.md` (Standard 2-4 days, express shipping, international terms)
* `policies/refund_policy.md` (Bank processing timeframes, cancellation refunds)
* `faq/customer_faq.md` (Common support queries, payment options)

---

### Step 5.2: Context-Aware Prompt Injection (`src/agent/prompts.py`)

```text
=== ACTIVE WEBSITE CONTEXT ===
- Customer Current Page: {current_path}
- Active Viewing Product: {viewing_product_name} (ID: {viewing_product_id})
- Cart Item Count: {cart_item_count} items (Total: {cart_total_pkr} PKR)
- Authenticated Customer ID: {customer_id}

RULES FOR RESOLVING COREFERENCES:
1. When the customer uses pronouns like "this", "it", or "the product" while viewing a product page, resolve the query directly to {viewing_product_name}.
2. Use search_knowledge_base for all policy, return, and warranty rules.
3. Always cite official source filenames in clickable markdown format, e.g. [NovaCart Warranty Policy](warranty_policy.md).
```

---

## 4. Verification & Testing Plan

1. **Page-Aware Policy Test:** Navigate to `/products/novabook-pro-14` and ask *"What is the return window for this?"* -> AI identifies NovaBook Pro and cites 30-day return policy from `return_policy.md`.
2. **Warranty Grounding Test:** Ask *"Does warranty cover liquid spills?"* -> AI cites `warranty_policy.md` stating accidental/liquid damage is excluded.
3. **Anti-Hallucination Assertion:** Inquire about non-existent policies -> AI gracefully responds that information is not in official records.

---

## 5. Phase Checklist

- [ ] Verify ChromaDB collection persistence in `storage/chromadb/`.
- [ ] Connect `search_knowledge_base` MMR retriever to the agent.
- [ ] Implement browser page context injection in system prompts.
- [ ] Test hybrid synthesis combining live database specs with vector policy docs.
- [ ] Verify 100% pass rate on RAG retrieval unit tests.
