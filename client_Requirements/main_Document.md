Project Name
SupportIQ — Intelligent AI Customer Support & Knowledge Agent

Tagline:

A context-aware RAG-powered customer support system with intelligent retrieval, tool calling, and automated customer assistance.

Client Project Brief
Client

E-commerce company — "NovaCart"

NovaCart is a growing e-commerce company selling electronics, accessories, laptops, smartphones, and home technology products.

The company currently handles customer support manually through email and website chat. Customers frequently ask repetitive questions about:

Product specifications
Shipping
Returns
Refunds
Warranty
Order status
Product availability
Payment policies
Discounts
Company policies

The company wants to build an AI-powered customer support system capable of answering customers using the company's official knowledge base while also interacting with internal business systems when necessary.

1. Main Objective

Build an AI customer-support assistant that can:

Understand natural-language customer questions.
Retrieve relevant information from company documents.
Answer questions using RAG rather than relying purely on the LLM's knowledge.
Decide when it needs to use external tools.
Retrieve real-time order information through an API.
Perform calculations when required.
Maintain conversation context.
Return structured responses where appropriate.
Provide citations/sources for knowledge-base answers.
Escalate complicated or sensitive issues to a human agent.

The system should be built primarily using:

Python
LangChain
LLM
RAG
Vector Database
Tools
Tool Calling
Structured Output
FastAPI

LangGraph is explicitly out of scope for this version.

2. Knowledge Base

The system will receive company documents such as:

knowledge_base/
│
├── shipping_policy.pdf
├── return_policy.pdf
├── refund_policy.pdf
├── warranty_policy.pdf
├── payment_policy.pdf
├── privacy_policy.pdf
├── customer_faq.pdf
│
├── product_catalog.pdf
├── laptop_manuals/
│   ├── dell_xps.pdf
│   ├── hp_spectre.pdf
│   └── lenovo_legion.pdf
│
└── company_policies/
    ├── discount_policy.pdf
    └── warranty_terms.pdf

The system must not hard-code the information from these documents.

Instead, it must dynamically ingest them.

3. Document Ingestion Pipeline

Build a proper ingestion pipeline:

Documents
    ↓
Document Loader
    ↓
Document Objects
    ↓
Metadata Extraction
    ↓
Text Splitting
    ↓
Chunks
    ↓
Embedding Model
    ↓
Vector Database

The system should preserve metadata such as:

{
    "source": "return_policy.pdf",
    "page": 4,
    "document_type": "policy",
    "department": "customer_support"
}

This metadata should later be used for:

filtering
citations
debugging
source attribution
4. Retrieval System

The system should use a Retriever abstraction rather than directly querying the vector database everywhere.

Initially implement:

Similarity Search
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Top K documents

Then improve it using:

MMR
Question
   ↓
Candidate documents
   ↓
MMR
   ↓
Relevant + diverse chunks

The system should allow configuration of:

k
similarity threshold
search type
metadata filters
5. Customer Question Classification

The assistant should distinguish between different types of questions.

For example:

Knowledge question

"What is your return policy?"

→ RAG

Order question

"Where is my order?"

→ Order API tool

Calculation

"If my laptop costs $1,200 and I have a 15% discount, how much do I pay?"

→ Calculator tool

Mixed question

"Can I return my laptop after 20 days and how much would my refund be?"

Potentially:

RAG
+
Calculator

The LLM should determine which capability is required.

6. RAG Tool

The retrieval system should be exposed to the LLM as a tool.

For example:

@tool
def search_knowledge_base(query: str):
    """
    Search NovaCart's official customer-support
    knowledge base.
    """

The LLM should be able to call this tool when it needs company-specific information.

7. Order Management Tool

Create a simulated backend API/database containing:

Order ID
Customer ID
Product
Quantity
Price
Order status
Shipping status
Tracking number
Order date
Expected delivery

Example:

{
    "order_id": "NC-10294",
    "customer_id": "CUS-552",
    "status": "Shipped",
    "tracking_number": "TRK-928381",
    "expected_delivery": "2026-08-29"
}

Expose it to the agent as a tool:

@tool
def get_order_status(order_id: str):
    ...
8. Product Search Tool

Create another tool:

@tool
def search_products(query: str):
    ...

This tool should be capable of finding:

Product name
Price
Stock
Specifications
Category
Rating

For example:

"Do you have a gaming laptop with 32GB RAM?"

The agent could call:

search_products(
    "gaming laptop 32GB RAM"
)
9. Calculator Tool

Create a safe calculator tool for:

Discounts
Taxes
Shipping costs
Refund amounts
Price comparisons

Example:

"What is the price after a 15% discount?"

The agent should use the calculator rather than relying on the LLM to perform arithmetic.

10. Tool Calling Architecture

The overall architecture should become:

                     CUSTOMER
                         ↓
                       LLM
                         ↓
                What should I do?
                         ↓
       ┌─────────────────┼──────────────────┐
       ↓                 ↓                  ↓
 Knowledge Tool      Order Tool       Product Tool
       ↓                 ↓                  ↓
   Retriever          API/DB             Database
       ↓
 Vector DB

The LLM should not directly access the database.

It should interact through controlled tools.

11. Tool Execution

The implementation must clearly separate:

Tool Selection
       ↓
Tool Call
       ↓
Tool Execution
       ↓
Tool Result
       ↓
LLM
       ↓
Final Response

For example:

Customer:
"Where is order NC-10294?"

LLM:
→ call get_order_status()

Tool:
→ database lookup

Tool result:
→ Shipped
→ Tracking number
→ Expected delivery

LLM:
→ Generate customer-friendly response
12. Conversation Memory

The system should maintain conversation context.

Example:

Customer:

"Where is my order NC-10294?"

AI:

"Your order has shipped."

Customer:

"When will it arrive?"

The system should understand that:

"it"

refers to:

NC-10294

The system should therefore maintain appropriate conversation history.

13. Structured Output

The system should use structured output where predictable machine-readable information is required.

For example:

class SupportResponse(BaseModel):

    answer: str

    category: str

    confidence: float

    requires_human: bool

    sources: list[str]

Possible output:

{
    "answer": "Your order has shipped...",
    "category": "order_status",
    "confidence": 0.94,
    "requires_human": false,
    "sources": []
}

This allows your application/frontend to consume the result reliably.

14. Source Citations

For RAG-generated answers, the system should provide sources.

Example:

Your standard return period is 30 days from delivery.

Sources:
• return_policy.pdf — Page 4

The system should never invent citations.

If the information isn't available:

"I couldn't find this information in NovaCart's official knowledge base."

15. Hallucination Protection

The assistant should follow:

Use company knowledge for company-specific claims.

For example:

Customer:

"Does NovaCart offer a 2-year warranty on laptops?"

If the knowledge base doesn't contain this:

The AI should not guess.

Instead:

"I couldn't verify the warranty period from the available
NovaCart documentation."
16. Human Escalation

The system should detect situations requiring a human.

Examples:

Refund dispute
Payment dispute
Angry customer
Legal complaint
Fraud suspicion
Unknown policy
Low retrieval confidence
Repeated failed attempts

Create:

@tool
def escalate_to_human(
    customer_issue: str
):
    ...

Example:

Customer:
"I was charged twice and want my money back."

Agent
 ↓
Recognizes sensitive financial issue
 ↓
Escalation tool
 ↓
Human support ticket
17. Confidence Handling

The system should distinguish between:

High confidence
Answer normally
Medium confidence
Answer + qualification
Low confidence
Don't guess
Escalate / ask clarification
18. Prompt Engineering

Create dedicated LangChain prompt templates.

For example:

SYSTEM:
You are NovaCart's customer-support assistant.

Rules:

1. Use the knowledge base for company policies.
2. Never invent company information.
3. Use tools when real-time information is required.
4. Use the calculator for arithmetic.
5. Escalate sensitive issues.
6. Cite sources when using the knowledge base.

Then dynamically inject:

Conversation history
+
Retrieved context
+
User question
+
Tool results
19. API

Create a FastAPI backend.

Example endpoints:

POST /chat
POST /documents/upload
POST /documents/ingest
GET  /orders/{order_id}
GET  /health

Example:

POST /chat

{
    "message": "Where is my order?",
    "conversation_id": "abc123"
}

Response:

{
    "answer": "Your order has shipped...",
    "category": "order_status",
    "sources": [],
    "requires_human": false
}
20. Frontend

You can initially use:

Streamlit

or later:

React

The interface should show:

----------------------------------
 NovaCart AI Support
----------------------------------

Customer:
Where is my order?

AI:
Your order NC-10294 has shipped...

Source:
Order Management System

----------------------------------

For RAG answers:

Sources
────────────────────
return_policy.pdf
Page 4
21. Streaming

The response should stream rather than waiting for the entire answer.

AI:
Your order...
        ↓
has shipped...
        ↓
and is expected...
        ↓
on August 29.

This gives the application a much more realistic ChatGPT-like experience.

22. Evaluation

You should create a test dataset:

question
expected_answer
expected_source
question_type

Example:

question,expected_source,type
"What is your return period?",return_policy.pdf,rag
"Where is order NC-1002?",order_api,tool
"Do you offer warranty?",warranty_policy.pdf,rag
"What is 20% of $500?",calculator,tool

Evaluate:

Retrieval accuracy
Answer correctness
Citation correctness
Hallucination rate
Tool selection accuracy
Tool execution success
Response latency
23. Security Requirements

The system should:

Never expose API keys.
Validate tool inputs.
Never allow arbitrary SQL execution.
Never execute arbitrary Python from users.
Authenticate users.
Restrict access to customer orders.
Prevent one customer from accessing another customer's information.
Log tool execution.
Rate-limit requests.

For example:

Customer A
   ↓
get_order_status("Customer B's order")
   ↓
Permission Check
   ↓
DENIED
24. Final Architecture

Your finished SupportIQ project should look like:

                         ┌──────────────┐
                         │   Customer   │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │   FastAPI    │
                         └──────┬───────┘
                                ↓
                       ┌─────────────────┐
                       │  LangChain LLM  │
                       └────────┬────────┘
                                ↓
                     ┌──────────┴──────────┐
                     │                     │
                     ↓                     ↓
              Knowledge Tool          Other Tools
                     ↓              ┌──────┼───────┐
                 Retriever           ↓      ↓       ↓
                     ↓            Orders Products Calculator
                 Vector DB
                     ↓
                  Chunks
                     ↓
                Tool Result
                     │
                     └──────────┐
                                ↓
                               LLM
                                ↓
                       Structured Output
                                ↓
                         Final Response
                                ↓
                     ┌──────────┴──────────┐
                     ↓                     ↓
                  Customer              Human
                                      Escalation
The project progression I'd actually use

Don't build everything simultaneously.

Milestone 1

Basic RAG

PDF → Chroma → Retriever → LLM
Milestone 2

Better RAG

Metadata
MMR
Citations
Query rewriting
Milestone 3

Tools

RAG Tool
Order Tool
Product Tool
Calculator
Milestone 4

Tool Calling

LLM → Tool Selection → Tool Execution → Result → LLM
Milestone 5

Memory + Structured Output

Conversation
+
Pydantic
+
Structured response
Milestone 6

Production API

FastAPI
+
Authentication
+
Logging
+
Streaming
Milestone 7

Evaluation

Retrieval evaluation
+
Answer evaluation
+
Tool evaluation