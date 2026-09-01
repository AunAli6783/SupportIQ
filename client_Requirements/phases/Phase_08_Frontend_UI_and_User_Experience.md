# Phase 08: Next.js & React Frontend Web Application (Industrial ChatGPT / Claude UI)

> **Phase Status:** Completed (100% Verified)  
> **Prerequisites:** Phase 07 Completed (FastAPI backend and SSE endpoints running)  
> **Target Outcome:** Industrial-standard ChatGPT / Claude-style Next.js (React / TypeScript / Tailwind CSS) web interface featuring rich markdown formatting, interactive clickable source badges, clean 2-paragraph responses without raw dollar signs, one-click PowerPoint (.pptx) file downloads, message copy buttons, and automatic conversation titling.

---

## 1. Objective

Build a modern, production-grade Next.js (React + TypeScript + Tailwind CSS) single-page web application delivering an intuitive, industrial-grade conversational user experience. The frontend connects directly to our FastAPI backend (`http://localhost:8000/api/v1`).

---

## 2. Frontend Features & UX Standards

1. **ChatGPT & Claude-Style Natural Conversation Sidebar:**
   * Automatically titles conversations using the customer's first question (e.g. *"Where is my order NC-10003?"* instead of raw session IDs).
   * Technical parameters (raw session tokens) are cleanly managed under the hood without cluttering the user interface.

2. **Rich Markdown & Clean Link Rendering:**
   * Uses `react-markdown` to render bold text, bulleted lists, and inline code badges without awkward raw asterisks.
   * External web links and citations render as **glowing cyan pill links** with external link icons that open directly in a new tab.

3. **Interactive Domain Citation Badges:**
   * Sources shown below responses appear as interactive cards with domain names (e.g. `🌐 reuters.com`, `🌐 geekwire.com`, `📄 RETURN POLICY`).

4. **One-Click Presentation Downloads:**
   * When PowerPoint presentations are generated, a dedicated **"📥 Download PowerPoint (.pptx)"** action button downloads the `.pptx` slide deck directly to the user's computer.

5. **Category Status Badges & Quick Action Controls:**
   * Categorizes messages: 📦 `Order Status`, 💻 `Product Catalog`, 📖 `Policy Knowledge`, 🌐 `Live Web Search`, 🧮 `Financial Calculation`, 🚨 `Escalation`, 📊 `PowerPoint Presentation`.
   * Includes one-click message copy buttons with `Copied ✓` feedback.

---

## 3. Implementation Codebase (`frontend/app/page.tsx`)

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, Bot, User, ShieldAlert, Sparkles, RefreshCw, Layers, CheckCircle2, 
  MessageSquare, Plus, Globe, Copy, Check, ExternalLink, Package, ShoppingBag, 
  Calculator, ShieldCheck, Trash2, FileText, Download, BarChart3, Presentation
} from "lucide-react";
```

---

## 4. Verification & User Journey Test Plan

1. **Launch FastAPI Backend:**  
   `uvicorn app.main:app --reload` (Running at `http://localhost:8000`)

2. **Launch Next.js React Frontend:**  
   `cd frontend && npm run dev` (Running at `http://localhost:3000`)

3. **Browser Journey Tests:**
   * **Live Web News:** Ask *"What are the latest tech news stories today?"* -> Clickable `reuters.com` citation pill opens live article.
   * **PowerPoint Presentation:** Ask *"Create presentation for NovaBook Pro 14"* -> Clicking `Download PowerPoint (.pptx)` downloads `.pptx` file.
   * **Order Status:** Ask *"Where is order NC-10003?"* -> Returns 2-paragraph formatted delivery update.
   * **Human Escalation:** Ask *"I was double charged on my card!"* -> Displays red `ShieldAlert` escalation banner.

---

## 5. Phase 08 Completion Status

- [x] Implemented industrial ChatGPT/Claude style UI in `frontend/app/page.tsx`.
- [x] Configured rich markdown rendering without raw dollar or asterisk marks.
- [x] Added interactive clickable citation badges with live website domain labels.
- [x] Added one-click PowerPoint (.pptx) download action button.
- [x] Added dynamic first-message conversation titling in sidebar.
- [x] Verified complete frontend production build with `npm run build`.
