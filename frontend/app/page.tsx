"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, Bot, User, ShieldAlert, Sparkles, RefreshCw, Layers, CheckCircle2, 
  MessageSquare, Plus, Globe, Copy, Check, ExternalLink, Package, ShoppingBag, 
  Calculator, ShieldCheck, Trash2, FileText, Download, BarChart3, Presentation
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

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

export default function SupportIQChat() {
  const [conversationId, setConversationId] = useState("");
  const [customerId] = useState("CUS-002"); // Handled internally
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedEngine, setSelectedEngine] = useState("google:gemini-3.6-flash");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("serper");

  useEffect(() => {
    const savedEngine = localStorage.getItem("supportiq_llm_engine");
    if (savedEngine) setSelectedEngine(savedEngine);
    const savedSearch = localStorage.getItem("supportiq_search_engine");
    if (savedSearch) setSelectedSearchEngine(savedSearch);
  }, []);

  const handleEngineChange = (engine: string) => {
    setSelectedEngine(engine);
    localStorage.setItem("supportiq_llm_engine", engine);
  };

  const handleSearchEngineChange = (engine: string) => {
    setSelectedSearchEngine(engine);
    localStorage.setItem("supportiq_search_engine", engine);
  };

  const API_URL = "http://localhost:8000/api/v1";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load saved sessions from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem("supportiq_chat_sessions");
    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        setChatSessions(parsed);
        if (parsed.length > 0) {
          setConversationId(parsed[0].id);
          return;
        }
      } catch (e) {}
    }
    // Initialize first session if none exists
    const newId = "conv_" + Math.random().toString(36).substring(2, 9);
    setConversationId(newId);
  }, []);

  // Fetch past conversation history when active conversation changes
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

  const handleStartNewChat = () => {
    const newId = "conv_" + Math.random().toString(36).substring(2, 9);
    setConversationId(newId);
    setMessages([]);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/chat/session/${sessionId}`, { method: "DELETE" });
    } catch (e) {}

    const updated = chatSessions.filter((s) => s.id !== sessionId);
    setChatSessions(updated);
    localStorage.setItem("supportiq_chat_sessions", JSON.stringify(updated));

    if (conversationId === sessionId) {
      if (updated.length > 0) {
        setConversationId(updated[0].id);
      } else {
        handleStartNewChat();
      }
    }
  };

  const handleClearAllHistory = () => {
    localStorage.removeItem("supportiq_chat_sessions");
    setChatSessions([]);
    handleStartNewChat();
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleActionClick = (act: string) => {
    if (act.toLowerCase().includes("download") || act.toLowerCase().includes(".pptx")) {
      window.open(`${API_URL}/reports/download/NovaCart_Sales_Performance_Report.pptx`, "_blank");
    } else {
      handleSendMessage(act);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query };
    const isFirstMessage = messages.length === 0;
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    // Auto-update conversation title in recent chats sidebar (ChatGPT style)
    if (isFirstMessage) {
      const generatedTitle = query.length > 32 ? query.substring(0, 32) + "..." : query;
      const updatedSession: ChatSession = {
        id: conversationId,
        title: generatedTitle,
        updatedAt: Date.now(),
      };

      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== conversationId);
        const newList = [updatedSession, ...filtered].slice(0, 15);
        localStorage.setItem("supportiq_chat_sessions", JSON.stringify(newList));
        return newList;
      });
    }

    try {
      const [prov, mdl] = selectedEngine.split(":");
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversation_id: conversationId,
          customer_id: customerId,
          provider: prov,
          model: mdl,
          search_engine: selectedSearchEngine,
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
          content: "❌ **Connection Error:** Unable to reach SupportIQ backend. Please ensure the server is running on `http://localhost:8000`.",
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
      case "presentation_generation":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700 text-indigo-300"><Presentation className="w-3 h-3 text-indigo-400" /> PowerPoint Presentation</span>;
      case "sales_analytics":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300"><BarChart3 className="w-3 h-3 text-teal-400" /> Sales Analytics</span>;
      case "calculation":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300"><Calculator className="w-3 h-3" /> Financial Calculation</span>;
      case "escalation":
        return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300"><ShieldCheck className="w-3 h-3" /> Escalation</span>;
      default:
        return null;
    }
  };

  const activeSessionTitle = chatSessions.find((s) => s.id === conversationId)?.title || "New Chat";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* SIDEBAR PANEL (ChatGPT & Claude Style) */}
      <aside className="w-72 border-r border-slate-800/70 p-4 flex flex-col justify-between bg-slate-900/40 backdrop-blur-xl">
        <div className="flex flex-col h-full overflow-hidden">
          {/* BRAND HEADER */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight text-white">SupportIQ</h1>
              <span className="text-[11px] text-indigo-400 font-medium">NovaCart AI Assistant</span>
            </div>
          </div>

          {/* + NEW CHAT BUTTON (ChatGPT Style) */}
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 mb-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-200 rounded-xl font-medium text-sm transition shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>New Chat</span>
          </button>

          {/* RECENT CHATS LIST */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Recent Chats
            </div>

            {chatSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                No recent conversations
              </div>
            ) : (
              chatSessions.map((session) => {
                const isActive = session.id === conversationId;
                return (
                  <div
                    key={session.id}
                    onClick={() => setConversationId(session.id)}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition ${
                      isActive
                        ? "bg-slate-800/90 text-white shadow-sm border border-slate-700/60"
                        : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="truncate">{session.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      title="Delete Chat"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="pt-3 border-t border-slate-800/70 space-y-2">
          {chatSessions.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear all chats</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>SupportIQ Operational</span>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT DISPLAY */}
      <main className="flex-1 flex flex-col justify-between bg-slate-950">
        {/* TOP HEADER */}
        <header className="h-14 border-b border-slate-800/60 px-6 flex items-center justify-between bg-slate-950/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 truncate max-w-md">
              {activeSessionTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Model Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={selectedEngine}
                onChange={(e) => handleEngineChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="google:gemini-3.6-flash" className="bg-slate-900 text-slate-200">
                  ✨ Gemini 3.6 Flash
                </option>
                <option value="groq:openai/gpt-oss-120b" className="bg-slate-900 text-slate-200">
                  ⚡ GPT-OSS 120B
                </option>
                <option value="groq:qwen/qwen3.6-27b" className="bg-slate-900 text-slate-200">
                  🦙 Qwen 27B
                </option>
              </select>
            </div>

            {/* Search Scraper Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedSearchEngine}
                onChange={(e) => handleSearchEngineChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="serper" className="bg-slate-900 text-slate-200">
                  🌐 Google (Serper)
                </option>
                <option value="tavily" className="bg-slate-900 text-slate-200">
                  🦅 Tavily AI
                </option>
                <option value="duckduckgo" className="bg-slate-900 text-slate-200">
                  🦆 DuckDuckGo
                </option>
              </select>
            </div>
          </div>
        </header>

        {/* MESSAGES DISPLAY AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 max-w-xl mx-auto">
              <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 mb-4">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">How can SupportIQ help you?</h2>
              <p className="text-sm mt-2 text-slate-400 leading-relaxed">
                NovaCart's intelligent assistant equipped with RAG policy documents, live 2026 web search, product catalog, and order tracking.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8 w-full text-left">
                <button
                  onClick={() => handleSendMessage("Where is my order NC-10003?")}
                  className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 transition"
                >
                  <span className="font-semibold text-slate-200 block mb-1">📦 Order Tracking</span>
                  Where is my order NC-10003?
                </button>
                <button
                  onClick={() => handleSendMessage("Do you have gaming laptops with 32GB RAM in stock?")}
                  className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 transition"
                >
                  <span className="font-semibold text-slate-200 block mb-1">💻 Product Search</span>
                  Laptops with 32GB RAM?
                </button>
                <button
                  onClick={() => handleSendMessage("What is NovaCart's return policy for unopened items?")}
                  className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 transition"
                >
                  <span className="font-semibold text-slate-200 block mb-1">📖 Policy Knowledge</span>
                  Return policy for unopened items?
                </button>
                <button
                  onClick={() => handleSendMessage("Create a PowerPoint presentation showing our product sales performance and statistics.")}
                  className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 transition"
                >
                  <span className="font-semibold text-indigo-300 block mb-1 flex items-center gap-1.5"><Presentation className="w-3.5 h-3.5 text-indigo-400" /> Sales Analytics Presentation</span>
                  Generate sales slides (.pptx)
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-900 border border-slate-800 text-indigo-400"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                </div>

                <div className="space-y-2 max-w-2xl flex-1">
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
                        : "bg-slate-900 border border-slate-800/80 text-slate-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 space-y-2">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 my-2 text-slate-200">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 my-2 text-slate-200">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed text-slate-300">{children}</li>,
                            code: ({ children }) => <code className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-xs font-mono text-indigo-300">{children}</code>,
                            a: ({ href, children }) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4 inline-flex items-center gap-1 hover:bg-cyan-950/40 px-1 py-0.5 rounded transition"
                              >
                                {children} <ExternalLink className="w-3 h-3 inline text-cyan-400" />
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* CLICKABLE CITATION SOURCE CARDS */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.sources.map((src, sIdx) => {
                        const isUrl = src.source.startsWith("http://") || src.source.startsWith("https://");
                        let domain = src.source;
                        if (isUrl) {
                          try {
                            domain = new URL(src.source).hostname.replace("www.", "");
                          } catch {
                            domain = src.source;
                          }
                        }

                        return isUrl ? (
                          <a
                            key={sIdx}
                            href={src.source}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-cyan-300 transition group shadow-sm"
                            title={src.source}
                          >
                            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="font-medium text-slate-300 group-hover:text-cyan-200 truncate max-w-[200px]">
                              {domain}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                          </a>
                        ) : (
                          <span
                            key={sIdx}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="font-medium text-slate-300 truncate max-w-[200px]">
                              {src.source.replace(".md", "").replace(/_/g, " ")}
                            </span>
                          </span>
                        );
                      })}
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
                      {msg.suggested_actions.map((act, aIdx) => {
                        const isDownload = act.toLowerCase().includes("download") || act.toLowerCase().includes(".pptx");
                        return (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                              isDownload
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 font-semibold"
                                : "bg-slate-900 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-800 text-slate-300"
                            }`}
                          >
                            {isDownload && <Download className="w-3.5 h-3.5" />}
                            {act}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-sm p-2 max-w-3xl mx-auto">
              <Bot className="w-5 h-5 animate-spin text-indigo-500" />
              <span>SupportIQ is thinking and executing required tools...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX (ChatGPT / Claude Floating Style) */}
        <div className="p-4 md:p-6 bg-slate-950">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Message SupportIQ (e.g. order status, laptops, return policy, 2026 tech trends)..."
              className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 pr-12 shadow-lg transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
