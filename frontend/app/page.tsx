"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, Bot, User, ShieldAlert, Sparkles, RefreshCw, Layers, CheckCircle2, 
  MessageSquare, Plus, History, Globe, Copy, Check, ExternalLink, Package, ShoppingBag, Calculator, ShieldCheck
} from "lucide-react";

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
  requires_human?: boolean;
  suggested_actions?: string[];
}

export default function SupportIQChat() {
  const [conversationId, setConversationId] = useState("conv_" + Math.random().toString(36).substring(2, 9));
  const [customerId, setCustomerId] = useState("CUS-002");
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedSessions, setSavedSessions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const API_URL = "http://localhost:8000/api/v1";

  // Load saved session IDs from localStorage on mount
  useEffect(() => {
    const local = localStorage.getItem("supportiq_sessions");
    if (local) {
      try {
        setSavedSessions(JSON.parse(local));
      } catch (e) {}
    }
  }, []);

  // Save active conversationId to recent sessions list
  useEffect(() => {
    if (!conversationId) return;
    setSavedSessions((prev) => {
      if (prev.includes(conversationId)) return prev;
      const updated = [conversationId, ...prev].slice(0, 8);
      localStorage.setItem("supportiq_sessions", JSON.stringify(updated));
      return updated;
    });
  }, [conversationId]);

  // Fetch past conversation history when Active Session ID changes
  useEffect(() => {
    if (!conversationId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/history/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            setMessages([]);
          }
        }
      } catch (e) {}
    };

    fetchHistory();
  }, [conversationId]);

  const handleNewChat = () => {
    const newId = "conv_" + Math.random().toString(36).substring(2, 9);
    setConversationId(newId);
    setMessages([]);
  };

  const handleResetSession = async () => {
    setMessages([]);
    try {
      await fetch(`${API_URL}/chat/session/${conversationId}`, { method: "DELETE" });
    } catch (e) {}
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

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
          content: "❌ **Connection Error:** Unable to reach SupportIQ FastAPI backend. Please make sure `uvicorn app.main:app --reload --port 8000` is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    switch (category) {
      case "order_status":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300"><Package className="w-3 h-3" /> Order Status</span>;
      case "product_search":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300"><ShoppingBag className="w-3 h-3" /> Product Catalog</span>;
      case "policy_inquiry":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300"><Layers className="w-3 h-3" /> Policy Knowledge</span>;
      case "internet_search":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300"><Globe className="w-3 h-3" /> Live Web Search</span>;
      case "calculation":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300"><Calculator className="w-3 h-3" /> Financial Calculation</span>;
      case "escalation":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300"><ShieldCheck className="w-3 h-3" /> Escalation</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* SIDEBAR PANEL */}
      <aside className="w-80 border-r border-slate-800/80 p-6 flex flex-col justify-between bg-slate-900/60 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-white">SupportIQ</h1>
              <span className="text-xs text-indigo-400 font-medium tracking-wide">Enterprise AI Assistant</span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Start New Chat
          </button>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Session ID</label>
              <input
                type="text"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer Security Token</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* RECENT CONVERSATIONS HISTORY LIST */}
            {savedSessions.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <History className="w-3.5 h-3.5 text-indigo-400" /> Recent Sessions
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {savedSessions.map((sId) => (
                    <button
                      key={sId}
                      onClick={() => setConversationId(sId)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                        sId === conversationId
                          ? "bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 font-semibold"
                          : "bg-slate-800/40 hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="truncate">{sId}</span>
                      {sId === conversationId && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleResetSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Current History
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 space-y-1">
          <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Backend Online: <span className="font-mono text-slate-300">localhost:8000</span>
          </p>
          <p className="text-slate-400">Stack: Next.js + FastAPI + ChromaDB + Groq</p>
        </div>
      </aside>

      {/* MAIN CHAT DISPLAY */}
      <main className="flex-1 flex flex-col justify-between bg-slate-950">
        {/* MESSAGES DISPLAY AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 mb-4">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">How can SupportIQ help you today?</h2>
              <p className="text-sm max-w-md mt-2 text-slate-400">
                Ask about order status, gaming laptop catalog, return policies, 2026 tech trends, or discount math.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8 max-w-2xl text-left">
                <button
                  onClick={() => handleSendMessage("Where is my order NC-10003?")}
                  className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 transition group"
                >
                  <span className="font-semibold text-slate-200 block mb-1">📦 Order Tracking</span>
                  Where is my order NC-10003?
                </button>
                <button
                  onClick={() => handleSendMessage("Do you have gaming laptops with 32GB RAM in stock?")}
                  className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 transition group"
                >
                  <span className="font-semibold text-slate-200 block mb-1">💻 Product Search</span>
                  Do you have laptops with 32GB RAM?
                </button>
                <button
                  onClick={() => handleSendMessage("What is NovaCart's return policy for unopened items?")}
                  className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 transition group"
                >
                  <span className="font-semibold text-slate-200 block mb-1">📖 Policy Knowledge</span>
                  Return policy for unopened items?
                </button>
                <button
                  onClick={() => handleSendMessage("What are the latest gaming laptop trends in 2026?")}
                  className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 transition group"
                >
                  <span className="font-semibold text-slate-200 block mb-1">🌐 Live Web Search</span>
                  What are the latest laptop trends in 2026?
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 max-w-4xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-900 border border-slate-800 text-indigo-400"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className="space-y-2.5 max-w-2xl">
                  {/* CATEGORY BADGE & COPY BUTTON */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-between gap-2">
                      {getCategoryBadge(msg.category)}
                      <button
                        onClick={() => handleCopyText(msg.content, i)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800/60 transition"
                      >
                        {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedIdx === i ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}

                  {/* CHAT BUBBLE WITH REACT-MARKDOWN RENDERING */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 space-y-2">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2 text-slate-200">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2 text-slate-200">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => <code className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-xs font-mono text-indigo-300">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-0.5">
                                {children} <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* CITATIONS CARDS */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300"
                        >
                          {src.category === "web_search" ? <Globe className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
                          <span className="font-mono text-slate-300 truncate max-w-xs">{src.source}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* HUMAN ESCALATION ALERT */}
                  {msg.requires_human && (
                    <div className="flex items-center gap-2 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs font-medium">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                      <span>Request Escalated to NovaCart Senior Human Support Agent</span>
                    </div>
                  )}

                  {/* SUGGESTED ACTIONS BUTTONS */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggested_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(act)}
                          className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-800 rounded-lg text-slate-300 transition"
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
            <div className="flex items-center gap-3 text-slate-400 text-sm p-2">
              <Bot className="w-5 h-5 animate-spin text-indigo-500" />
              <span>SupportIQ is thinking and executing required tools...</span>
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about products, orders, returns, 2026 tech trends, or policies..."
              className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 pr-12 shadow-inner"
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
