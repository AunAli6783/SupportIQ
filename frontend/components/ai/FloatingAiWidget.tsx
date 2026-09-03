'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Globe, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink,
  ChevronUp,
  MessageSquare,
  FileText,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Package,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS } from '../../data/products';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  category?: string;
  confidence?: number;
  sources?: Array<{ source: string; category?: string; department?: string }>;
  suggestedActions?: string[];
  timestamp: string;
}

export default function FloatingAiWidget() {
  const pathname = usePathname();
  const { items, totalAmount, itemCount, addToCart } = useCart();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Engine Switchers
  const [selectedEngine, setSelectedEngine] = useState('google:gemini-3.6-flash');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('serper');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Identify currently viewed product if on /products/[id]
  const viewingProductId = pathname.startsWith('/products/') ? pathname.replace('/products/', '') : null;
  const viewingProduct = viewingProductId ? PRODUCTS.find((p) => p.id === viewingProductId) : null;

  // DYNAMIC CONTEXTUAL QUICK ACTION CHIPS
  const getContextualChips = () => {
    if (viewingProduct) {
      return [
        `Does ${viewingProduct.name.split(' ')[0]} have an official warranty?`,
        `Is this currently in stock?`,
        `Calculate 10% student discount on this`,
        `What are the full hardware specs for this?`
      ];
    }
    if (pathname === '/cart' || pathname === '/checkout') {
      return [
        'Do I qualify for Free Express Shipping?',
        'Can I pay via Cash on Delivery (COD)?',
        'What is your 30-day return policy?',
        'Estimated delivery time to Islamabad / Karachi?'
      ];
    }
    if (pathname === '/orders') {
      return [
        'Where is my latest order NC-10002?',
        'How do I cancel an unfulfilled order?',
        'How do I initiate a replacement RMA request?',
        'Generate executive presentation on sales (.pptx)'
      ];
    }
    // Default Homepage Chips
    return [
      'Where is my order?',
      'Best laptops for AI development 2026',
      'What is your 30-day return policy?',
      'Compare iPhone 16 Pro Max vs Galaxy S25 Ultra'
    ];
  };

  useEffect(() => {
    const savedLlm = localStorage.getItem('novacart_llm_engine');
    if (savedLlm) setSelectedEngine(savedLlm);
    const savedSearch = localStorage.getItem('novacart_search_engine');
    if (savedSearch) setSelectedSearchEngine(savedSearch);

    // Initial greeting if empty
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_1',
          sender: 'assistant',
          text: `👋 Hi ${user?.name || 'there'}! I'm **Nova AI**, your live shopping and customer care assistant. I'm connected to the live catalog and order database. How can I help you?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: getContextualChips()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleEngineChange = (val: string) => {
    setSelectedEngine(val);
    localStorage.setItem('novacart_llm_engine', val);
  };

  const handleSearchEngineChange = (val: string) => {
    setSelectedSearchEngine(val);
    localStorage.setItem('novacart_search_engine', val);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const [prov, mdl] = selectedEngine.split(':');
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversation_id: `conv_${user?.id || 'guest'}`,
          customer_id: user?.id,
          provider: prov,
          model: mdl,
          search_engine: selectedSearchEngine,
          // Transmit complete live page & website context
          page_context: {
            current_path: pathname,
            viewing_product_id: viewingProduct?.id,
            viewing_product_name: viewingProduct?.name,
            viewing_product_price: viewingProduct?.price,
            cart_item_count: itemCount,
            cart_total_pkr: totalAmount,
            customer_name: user?.name,
            customer_city: user?.city,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Response generated successfully.',
        category: data.category,
        confidence: data.confidence,
        sources: data.sources || [],
        suggestedActions: data.suggested_actions?.length ? data.suggested_actions : getContextualChips().slice(0, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Connection Notice:** Unable to reach SupportIQ backend on \`${API_URL}\`. Please ensure the FastAPI server is running (\`uvicorn app.main:app --port 8000\`).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING 3D ROBOT LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle speech bubble teaser */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-sky-100 animate-in fade-in slide-in-from-right-3 duration-300">
            <span className="w-2 h-2 rounded-full bg-[#008ECC] animate-ping" />
            <span>
              {viewingProduct ? `Ask about ${viewingProduct.name.split(' ')[0]}!` : 'Need shopping help? Chat with me!'}
            </span>
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white/95" />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Nova AI Assistant"
            className="relative group p-1.5 rounded-full bg-gradient-to-tr from-[#008ECC] via-sky-500 to-[#212844] shadow-2xl shadow-sky-500/40 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white"
          >
            {/* Pulsing ring indicator */}
            <span className="absolute -inset-1 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />

            {/* Circular container with exact 3D robot image */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-b from-sky-400 to-[#008ECC] border-2 border-white shadow-inner flex items-center justify-center">
              <img
                src="/nova-robot.jpg"
                alt="Nova AI Robot"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Online status indicator */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
          </button>
        </div>
      )}

      {/* 2. EXPANDABLE CHAT DRAWER */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[440px] md:w-[480px] h-[640px] max-h-[90vh] bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* HEADER */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#008ECC] shadow-md shadow-sky-500/20 shrink-0 bg-sky-400">
                <img
                  src="/nova-robot.jpg"
                  alt="Nova AI Robot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-none">
                  Nova AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>Context-Aware</span>
                  <span>•</span>
                  <span className="text-sky-400 font-medium">{user ? user.name : 'Guest'}</span>
                </p>
              </div>
            </div>

            {/* HEADER CONTROLS */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([])}
                title="Clear Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ENGINE CONTROLS BAR (Model & Scraper Switcher) */}
          <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            {/* LLM Model Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
              <select
                value={selectedEngine}
                onChange={(e) => handleEngineChange(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] font-medium focus:outline-none cursor-pointer"
              >
                <option value="google:gemini-3.6-flash" className="bg-slate-900 text-slate-200">✨ Gemini 3.6 Flash</option>
                <option value="groq:openai/gpt-oss-20b" className="bg-slate-900 text-slate-200">⚡ GPT-OSS 20B</option>
                <option value="groq:openai/gpt-oss-120b" className="bg-slate-900 text-slate-200">🧠 GPT-OSS 120B</option>
              </select>
            </div>

            {/* Search Scraper Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <select
                value={selectedSearchEngine}
                onChange={(e) => handleSearchEngineChange(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] font-medium focus:outline-none cursor-pointer"
              >
                <option value="serper" className="bg-slate-900 text-slate-200">🌐 Google Serper</option>
                <option value="tavily" className="bg-slate-900 text-slate-200">🦅 Tavily AI</option>
                <option value="gdelt" className="bg-slate-900 text-slate-200">📡 GDELT News</option>
                <option value="duckduckgo" className="bg-slate-900 text-slate-200">🦆 DuckDuckGo</option>
              </select>
            </div>
          </div>

          {/* ACTIVE WEBSITE CONTEXT INDICATOR */}
          {viewingProduct ? (
            <div className="bg-[#008ECC]/15 border-b border-[#008ECC]/30 px-3 py-2 flex items-center justify-between text-[11px] text-sky-300">
              <div className="truncate flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#008ECC] shrink-0" />
                <span className="truncate">
                  Viewing: <strong className="text-white">{viewingProduct.name}</strong> ({viewingProduct.price.toLocaleString()} PKR)
                </span>
              </div>
              <button
                onClick={() => handleSend(`Does this have an official warranty and is it in stock?`)}
                className="underline hover:text-white text-[10px] shrink-0 font-bold ml-2"
              >
                Ask About This
              </button>
            </div>
          ) : itemCount > 0 ? (
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3 text-emerald-400" />
                Cart: <strong>{itemCount} items ({totalAmount.toLocaleString()} PKR)</strong>
              </span>
              <button
                onClick={() => handleSend('Do I qualify for free express shipping with my current cart?')}
                className="underline hover:text-sky-300 text-[10px]"
              >
                Check Shipping
              </button>
            </div>
          ) : null}

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed relative group ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#008ECC] to-sky-600 text-white rounded-tr-none shadow-md shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 font-bold underline hover:text-cyan-300 inline-flex items-center gap-0.5"
                        >
                          {props.children}
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      ),
                      p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-1" {...props} />,
                      li: ({ node, ...props }) => <li {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>

                  {/* SOURCES BADGES */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                      {msg.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          {s.source}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* COPY BUTTON */}
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-opacity"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* SUGGESTED ACTION CHIPS */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action)}
                        className="text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-[#008ECC]/50 px-2.5 py-1 rounded-full transition-colors text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3.5 py-2.5 rounded-2xl w-fit">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Nova AI is evaluating page context & database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                viewingProduct 
                  ? `Ask about ${viewingProduct.name.split(' ')[0]} (warranty, stock, specs)...` 
                  : "Ask anything about orders, products, specs, policies..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#008ECC]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-[#008ECC] to-sky-600 hover:from-[#007BB0] hover:to-sky-700 disabled:opacity-40 text-white p-2 rounded-xl transition-colors shrink-0 shadow-md shadow-sky-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
