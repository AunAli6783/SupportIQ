# SupportIQ — Implementation Plan & Phase Roadmap

> **Project:** SupportIQ — Intelligent AI Customer Support & Knowledge Agent  
> **Client:** NovaCart (E-commerce Electronics & Tech Retailer)  
> **Location of Requirements:** `D:\SupportIQ\client_Requirements\main_Document.md`  
> **Location of Knowledge Base:** `D:\SupportIQ\NovaCart_SupportIQ_Knowledge_Base\novacart_knowledge_base`  
> **Architecture:** LangChain RAG + Tool Calling + FastAPI + Vector DB (ChromaDB) + Streamlit UI *(LangGraph out of scope)*

---

## Executive Summary

SupportIQ is an automated, context-aware AI customer support assistant designed for NovaCart. The system combines **Retrieval-Augmented Generation (RAG)** over official policy documentation and product manuals with **Agentic Tool Calling** (order tracking, product search catalog, safe financial calculator, and human escalation).

This folder (`D:\SupportIQ\client_Requirements\phases`) contains the complete, step-by-step phase implementation plan. Each phase document details the architecture, file layout, class/function definitions, security controls, and verification steps required to build and deploy SupportIQ.

---

## Zero-Cost & Low-Storage Model Selection Architecture

To fulfill strict **Zero-Cost** (no paid APIs) and **Low-Disk Storage** (no multi-gigabyte local model downloads) constraints, SupportIQ is configured with the following free, zero-overhead models:

| Component | Selected Model / Service | Cost | Disk Storage | Engine / Provider |
| :--- | :--- | :--- | :--- | :--- |
| **Primary LLM (Cloud)** | `gemini-1.5-flash` or `gemini-2.0-flash` | **100% FREE** | **0 MB** | Google AI Studio API (Free Tier) |
| **Fallback LLM (Cloud)** | `llama-3.1-8b-instant` | **100% FREE** | **0 MB** | Groq API (Free Tier) |
| **Local LLM (Optional)** | `llama3.2:1b` or `qwen2.5:1.5b` | **100% FREE** | **< 1.3 GB** | Ollama (Local Micro Model) |
| **Embedding Model** | `sentence-transformers/all-MiniLM-L6-v2` | **100% FREE** | **~90 MB** | HuggingFace (Local CPU Execution) |

* **Zero Paid API Fees:** Uses Google AI Studio free key or Groq free key.
* **Minimal Disk Footprint:** Entire local embedding weights take only **90 MB**, and zero local storage is needed for LLM generation when using the free cloud APIs.

---

## Implementation Phase Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SUPPORTIQ IMPLEMENTATION ROADMAP                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

 Phase 01: Project Setup & System Foundation
 └── Directory layout, environment configuration, logging, base Pydantic settings.

 Phase 02: Document Ingestion & VectorStore Pipeline
 └── Dynamic Markdown/PDF parsing, metadata extraction, text chunking, ChromaDB vector indexing.

 Phase 03: Advanced Retrieval & Source Citation Engine
 └── Similarity & MMR search, metadata filters, citation formatting, anti-hallucination prompts.

 Phase 04: Custom Tool Suite & Business Backend
 └── Order API, Product Search, Safe Calculator, RAG Tool, Human Escalation tool implementations.

 Phase 05: Agentic Orchestration & Security Guardrails
 └── LangChain Tool Calling Agent, tool routing loop, cross-customer permission security guard.

 Phase 06: Conversation Memory & Structured Outputs
 └── Multi-turn session context, coreference resolution, Pydantic SupportResponse enforcement.

 Phase 07: Production FastAPI Backend & SSE Streaming
 └── REST endpoints (/chat, /ingest, /orders), Server-Sent Events (SSE) streaming, middleware.

 Phase 08: Interactive Next.js React UI & User Experience
 └── Next.js 14 React chat dashboard, citation inspector, tool call logs, human escalation badges.

 Phase 09: Automated Evaluation & Test Suite
 └── Benchmarking framework evaluating retrieval, tool routing, hallucination rate, and security.

 Phase 10: Live Internet Search Tool
 └── Live web search integration for current 2026 tech trends, market news, and policy non-override rules.

 Phase 11: AI Sales Analytics & Presentation Generator
 └── Python sales analytics engine, structured presentation plan Pydantic schema, and python-pptx presentation maker.
```

---

## Detailed Phase Matrix

| Phase | File Name | Focus Area | Key Output / Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 01** | [`Phase_01_Project_Setup_and_Architecture.md`](./Phase_01_Project_Setup_and_Architecture.md) | Project Architecture & Env | Directory structure, `config/settings.py`, dependencies, logging |
| **Phase 02** | [`Phase_02_Document_Ingestion_and_VectorStore.md`](./Phase_02_Document_Ingestion_and_VectorStore.md) | Ingestion & Vector DB | `ingest.py`, Metadata Extractor, ChromaDB vector collection |
| **Phase 03** | [`Phase_03_Advanced_Retrieval_and_Citations.md`](./Phase_03_Advanced_Retrieval_and_Citations.md) | Advanced RAG & Citations | MMR Retriever, Citation Engine, Anti-Hallucination Guardrails |
| **Phase 04** | [`Phase_04_Tools_Development_and_Mock_Services.md`](./Phase_04_Tools_Development_and_Mock_Services.md) | Tool Ecosystem | Order API Tool, Product Search Tool, Calculator Tool, Escalation Tool |
| **Phase 05** | [`Phase_05_Agentic_Orchestration_and_Security.md`](./Phase_05_Agentic_Orchestration_and_Security.md) | Tool Agent & Security | LangChain Agent Executor, Security Permission Check, System Prompt |
| **Phase 06** | [`Phase_06_Memory_and_Structured_Outputs.md`](./Phase_06_Memory_and_Structured_Outputs.md) | Context & Schemas | `SupportResponse` Pydantic model, Multi-turn Chat Memory Manager |
| **Phase 07** | [`Phase_07_FastAPI_Backend_and_Streaming.md`](./Phase_07_FastAPI_Backend_and_Streaming.md) | REST API & Streaming | FastAPI App, SSE Streaming Endpoint, Middleware, CORS, Health Checks |
| **Phase 08** | [`Phase_08_Frontend_UI_and_User_Experience.md`](./Phase_08_Frontend_UI_and_User_Experience.md) | User Interface | Next.js React Chat Interface with Citations, History Drawer, Session Drawer |
| **Phase 09** | [`Phase_09_Evaluation_Testing_and_Benchmarking.md`](./Phase_09_Evaluation_Testing_and_Benchmarking.md) | QA & Benchmarking | `evaluate.py` benchmark suite running against `test_questions.csv` |
| **Phase 10** | [`Phase_10_Live_Internet_Search_Tool.md`](./Phase_10_Live_Internet_Search_Tool.md) | Web Search & Trends | `search_internet` tool, live search formatting, policy non-override rules |
| **Phase 11** | [`Phase_11_AI_Sales_Analytics_and_Presentation_Maker.md`](./Phase_11_AI_Sales_Analytics_and_Presentation_Maker.md) | Sales Analytics & PPT | `get_sales_statistics` analytics tool, `PresentationPlan` schema, `python-pptx` builder |

---

## Target Technical Architecture

```
                          ┌───────────────────────────┐
                          │   Customer (Browser/UI)   │
                          └─────────────┬─────────────┘
                                        │ (HTTP / SSE Stream)
                                        ▼
                          ┌───────────────────────────┐
                          │   FastAPI REST Backend    │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  LangChain Agent Engine   │
                          │   (Tool Calling Agent)    │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │   Knowledge Tool    │    │   Order Status Tool │    │ Product Search Tool │
  └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘
             │                          │                          │
             ▼                          ▼                          ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │  Chroma Vector DB   │    │     orders.csv      │    │    products.csv     │
  │  (MMR Retriever)    │    │ (Permission Check)  │    │  (Catalog & Stock)  │
  └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │ (Tool Execution Results)
                                        ▼
                          ┌───────────────────────────┐
                          │  Pydantic SupportResponse │
                          │     (Structured Data)     │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │ Output: Answer + Sources  │
                          │   + Human Escalation Flag │
                          └───────────────────────────┘
```

---

## Knowledge Base Map & Dataset Integration

The system ingests the dataset located in `D:\SupportIQ\NovaCart_SupportIQ_Knowledge_Base\novacart_knowledge_base`:

* **Policies:** `policies/return_policy.md`, `shipping_policy.md`, `refund_policy.md`, `warranty_policy.md`, `payment_policy.md`, `cancellation_policy.md`.
* **Company Docs:** `company/privacy_policy.md`, `terms_conditions.md`.
* **FAQ:** `faq/customer_faq.md`.
* **Product Catalog:** `products/laptops.md`, `smartphones.md`, `accessories.md`, plus structured data in `data/products.csv`.
* **Order Management System (OMS Data):** `data/orders.csv`.
* **Evaluation Benchmark:** `tests/test_questions.csv`.

---

## How to Follow This Implementation Plan

1. Execute the phases **sequentially from Phase 01 to Phase 09**.
2. Each phase file is self-contained with code specifications, unit test requirements, and completion criteria.
3. Do not jump to downstream phases without verifying the prerequisites defined in the current phase.
