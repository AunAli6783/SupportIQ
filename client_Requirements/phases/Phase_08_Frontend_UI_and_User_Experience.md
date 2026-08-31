# Phase 08: Next.js & React Frontend Web Application

> **Phase Status:** Planned  
> **Prerequisites:** Phase 07 Completed (FastAPI backend and SSE endpoints running)  
> **Target Outcome:** Modern Next.js (React / TypeScript / Tailwind CSS) web interface rendering real-time SSE chat streaming, source citations, session memory controls, and human escalation alerts.

---

## 1. Objective

Build a modern, production-grade Next.js (React + TypeScript + Tailwind CSS) single-page web application to deliver a ChatGPT-like user experience for NovaCart's SupportIQ assistant. The frontend connects directly to our Phase 07 FastAPI backend (`http://localhost:8000/api/v1`).

---

## 2. Frontend Layout Blueprint

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                NovaCart SupportIQ Assistant                             │
 ├───────────────────────────────┬─────────────────────────────────────────────────────────┤
 │  SIDEBAR CONTROLS             │  MAIN CHAT DISPLAY                                      │
 │                               │                                                         │
 │  Session ID: [ conv_9281 ]    │  [Customer]: Where is my order NC-10003?               │
 │  Customer ID: [ CUS-102  ]    │                                                         │
 │                               │  [SupportIQ]: Your order NC-10003 has shipped via       │
 │  [ Clear Session History ]    │               Leopard Courier...                        │
 │                               │                                                         │
 │  System Status: Operational   │  ┌───────────────────────────────────────────────────┐  │
 │  Backend API: http://localhost│  │ 📖 Sources: return_policy.md (policy)             │  │
 │                               │  └───────────────────────────────────────────────────┘  │
 │  ──────────────────────────── │  ┌───────────────────────────────────────────────────┐  │
 │  ACTIVE METRICS               │  │ 🚨 Human Escalation Flagged: Ticket TICKET-NC     │  │
 │  Category: order_status       │  └───────────────────────────────────────────────────┘  │
 │  Confidence: 95%              │                                                         │
 │  Human Escalation: No         │  [ Chat Input Box: Type your question... ]            │
 └───────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Architecture (Next.js 14+ App Router)

```text
 frontend/
 ├── package.json                   <-- React, Next.js, Tailwind CSS, Lucide-React dependencies
 ├── next.config.js                 <-- Next.js config & API proxies
 ├── tailwind.config.js             <-- Tailwind CSS styling configuration
 ├── app/
 │   ├── layout.tsx                 <-- Root layout with Tailwind fonts & dark theme
 │   ├── globals.css                <-- Base styles & animations
 │   └── page.tsx                   <-- Main SupportIQ React Chat Interface
 └── components/
     ├── ChatSidebar.tsx            <-- Session ID, Customer ID & controls drawer
     ├── MessageList.tsx            <-- Chat message rendering & Markdown formatting
     ├── SourceCitations.tsx        <-- Grounded source citation cards
     ├── EscalationBanner.tsx       <-- Human support ticket alert banner
     └── ActionButtons.tsx          <-- Interactive suggested action buttons
```

---

## 4. Key React & Next.js Components

### Step 8.1: Package Dependencies (`frontend/package.json`)

```json
{
  "name": "supportiq-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.378.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3"
  }
}
```

---

### Step 8.2: Main Next.js Page (`frontend/app/page.tsx`)

```tsx
"use client";

import { useState } from "react";
import { Send, Bot, User, ShieldAlert, Sparkles, RefreshCw, Layers } from "lucide-react";

interface SourceCitation {
  source: string;
  category?: string;
  department?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  category?: string;
  sources?: SourceCitation[];
  requires_human?: bool;
  suggested_actions?: string[];
}

export default function SupportIQChat() {
  const [conversationId, setConversationId] = useState("conv_" + Math.random().toString(36).substring(2, 9));
  const [customerId, setCustomerId] = useState("CUS-002");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8000/api/v1";

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversation_id: conversationId,
          customer_id: customerId || undefined,
        }),
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();

      const aiMsg: Message = {
        role: "assistant",
        content: data.answer,
        category: data.category,
        sources: data.sources || [],
        requires_human: data.requires_human,
        suggested_actions: data.suggested_actions || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Connection Error: Unable to reach SupportIQ FastAPI backend. Ensure uvicorn server is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* SIDEBAR PANEL */}
      <aside className="w-80 border-r border-slate-800 p-6 flex flex-col justify-between bg-slate-900/50">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">SupportIQ</h1>
              <span className="text-xs text-indigo-400 font-medium">NovaCart AI Assistant</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Session ID</label>
              <input
                type="text"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer ID (Security Token)</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setMessages([])}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
            >
              <RefreshCw className="w-4 h-4" /> Reset Conversation
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          <p>Backend API: <span className="text-slate-300 font-mono">localhost:8000</span></p>
          <p>Architecture: Next.js + FastAPI + ChromaDB</p>
        </div>
      </aside>

      {/* MAIN CHAT DISPLAY */}
      <main className="flex-1 flex flex-col justify-between">
        {/* MESSAGES DISPLAY AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <Sparkles className="w-12 h-12 text-indigo-500 mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-slate-300">How can SupportIQ help you today?</h2>
              <p className="text-sm max-w-md mt-1">Ask about order tracking, gaming laptop specs, return policies, warranty rules, or pricing discounts.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600" : "bg-slate-800 border border-slate-700"}`}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"}`}>
                    {msg.content}
                  </div>

                  {/* CITATIONS CARDS */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.sources.map((src, sIdx) => (
                        <span key={sIdx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-400">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          {src.source} ({src.category || "policy"})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* HUMAN ESCALATION ALERT */}
                  {msg.requires_human && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs font-medium">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Request Escalated to NovaCart Senior Human Support Agent</span>
                    </div>
                  )}

                  {/* SUGGESTED ACTIONS BUTTONS */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {msg.suggested_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(act)}
                          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 rounded-lg text-slate-300 transition"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Bot className="w-5 h-5 animate-spin text-indigo-500" />
              <span>SupportIQ is thinking and executing required tools...</span>
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about products, orders, returns, warranty, or policies..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 pr-12"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 5. Verification & User Journey Test Plan

1. **Launch FastAPI Backend:**  
   `uvicorn app.main:app --reload` (Running at `http://localhost:8000`)

2. **Launch Next.js React Frontend:**  
   `cd frontend && npm run dev` (Running at `http://localhost:3000`)

3. **Browser Journey Tests:**
   * **Policy Search:** Ask *"What is the return period for unopened items?"* -> Verify Next.js renders `return_policy.md` source card.
   * **Order Status:** Ask *"Where is order NC-10003?"* -> Verify `Shipped` status and tracking number.
   * **Security Denial:** Change Customer ID to `CUS-9999` and ask for order `NC-10003` -> Verify `SECURITY DENIED` alert.
   * **Human Escalation:** Ask *"I was double charged on my card!"* -> Verify red `ShieldAlert` escalation banner.

---

## 6. Phase 08 Checklist

- [ ] Create Next.js project structure in `frontend/` directory.
- [ ] Configure `package.json` with React 18, Next.js 14, Tailwind CSS, and Lucide React.
- [ ] Implement `frontend/app/page.tsx` React component.
- [ ] Connect React frontend to FastAPI REST (`/api/v1/chat`) and SSE streaming endpoints.
- [ ] Test end-to-end user journeys in browser at `http://localhost:3000`.
