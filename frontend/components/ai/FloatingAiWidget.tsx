'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
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
  ShoppingCart,
  Package,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS, Product } from '../../data/products';

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
  const { items, totalAmount, itemCount, addToCart, refreshCart } = useCart();
  const { user, requireAuth } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  // Engine Switchers
  const [selectedEngine, setSelectedEngine] = useState('groq:openai/gpt-oss-120b');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('serper');
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Identify currently viewed product if on /products/[id]
  const viewingProductId = pathname.startsWith('/products/') ? pathname.replace('/products/', '') : null;
  const viewingProduct = viewingProductId ? PRODUCTS.find((p) => p.id === viewingProductId) : null;

  // Helper to detect products in text for inline interactive cards
  const detectProducts = (text: string): Product[] => {
    if (!text) return [];
    const tLower = text.toLowerCase();
    const matches: Product[] = [];
    
    for (const p of PRODUCTS) {
      const pIdLower = p.id.toLowerCase();
      const pNameLower = p.name.toLowerCase();
      
      if (tLower.includes(pIdLower)) {
        if (!matches.some((m) => m.id === p.id)) matches.push(p);
        continue;
      }
      
      const keyWords = pNameLower.split(' ').filter((w) => w.length > 3 && !['apple', 'laptop', 'phone', 'with'].includes(w));
      const matchCount = keyWords.filter((kw) => tLower.includes(kw)).length;
      if (matchCount >= 2 || (keyWords.length === 1 && matchCount === 1)) {
        if (!matches.some((m) => m.id === p.id)) matches.push(p);
      }
    }
    return matches.slice(0, 3);
  };

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
    let sId = sessionStorage.getItem('novacart_session_id');
    if (!sId) {
      sId = 'guest_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('novacart_session_id', sId);
    }
    setSessionId(sId);

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

  const handleInlineAddToCart = (prod: Product) => {
    requireAuth(() => {
      addToCart(prod, 1);
      setAddedItems((prev) => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [prod.id]: false }));
      }, 2000);
    }, `Sign in to add ${prod.name} to your cart.`);
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

    // If customer has intent to add/buy and is not logged in, prompt authentication first
    const qLower = query.toLowerCase();
    const isAddIntent = 
      qLower.includes('add to cart') || 
      qLower.includes('add to bag') || 
      qLower.includes('place order') || 
      qLower.includes('buy this') ||
      qLower.startsWith('add ');

    if (isAddIntent && !user) {
      requireAuth(() => {
        handleSendMessage(query);
      }, 'Sign in to add items to your cart, place orders, and view isolated purchases.');
      return;
    }

    setLoading(true);

    try {
      const [prov, mdl] = selectedEngine.split(':');
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversation_id: user?.id ? `conv_${user.id}` : `conv_${sessionId || 'guest'}`,
          customer_id: user?.id || 'CUS-001',
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

      // Real-time Database Cart Synchronization
      if (data.cart_action) {
        const action = data.cart_action;
        if (action.action === 'add_to_cart') {
          if (refreshCart) {
            await refreshCart(user?.id || 'CUS-001');
          }
          const matched = PRODUCTS.find((p) => p.id === action.product_id || p.name.toLowerCase().includes((action.product_name || '').toLowerCase()));
          if (matched) {
            handleInlineAddToCart(matched);
          }
        } else if (action.action === 'remove_from_cart') {
          if (refreshCart) {
            await refreshCart(user?.id || 'CUS-001');
          }
        }
      }

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
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold py-2 px-3.5 rounded-2xl shadow-xl border border-emerald-100 animate-in fade-in slide-in-from-right-3 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>
              {viewingProduct ? `Ask about ${viewingProduct.name.split(' ')[0]}!` : 'Need shopping help? Chat with me!'}
            </span>
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white/95" />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Nova AI Assistant"
            className="relative group p-1.5 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-slate-900 shadow-2xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white"
          >
            {/* Pulsing ring indicator */}
            <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />

            {/* Circular container with exact 3D robot image */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-white shadow-inner flex items-center justify-center">
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
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[450px] md:w-[480px] h-[660px] max-h-[92vh] bg-slate-950/95 backdrop-blur-2xl text-slate-100 rounded-3xl shadow-2xl border border-slate-800/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-white/10">
          
          {/* HEADER */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-[#062c19] to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/25 shrink-0 bg-emerald-950/60 p-0.5">
                  <img
                    src="/nova-robot.jpg"
                    alt="Nova AI Robot"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 leading-none tracking-tight">
                  Nova AI Assistant
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">SWOO 2026</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Browsing Context Active</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-bold">{user ? user.name : 'Guest User'}</span>
                </p>
              </div>
            </div>

            {/* HEADER CONTROLS */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([]);
                  const newSession = 'guest_' + Math.random().toString(36).substring(2, 9);
                  setSessionId(newSession);
                  sessionStorage.setItem('novacart_session_id', newSession);
                }}
                title="Clear Chat History"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Assistant"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ENGINE CONTROLS BAR (Model & Scraper Switcher) */}
          <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            {/* LLM Model Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
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
              <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
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
            <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-3 py-2 flex items-center justify-between text-[11px] text-emerald-300">
              <div className="truncate flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Viewing: <strong className="text-white">{viewingProduct.name}</strong> ({viewingProduct.price.toLocaleString()} PKR)
                </span>
              </div>
              <button
                onClick={() => handleSend(`Does this have an official warranty and is it in stock?`)}
                className="underline hover:text-white text-[10px] shrink-0 font-bold ml-2 text-emerald-400"
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
                className="underline hover:text-emerald-300 text-[10px]"
              >
                Check Shipping
              </button>
            </div>
          ) : null}

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const detectedProds = msg.sender === 'assistant' ? detectProducts(msg.text) : [];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[94%] rounded-2xl p-3.5 text-xs leading-relaxed relative group transition-all ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-tr-none shadow-lg shadow-emerald-500/20 font-medium'
                        : 'bg-slate-900/95 text-slate-200 border border-slate-800/80 rounded-tl-none shadow-sm backdrop-blur-md'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded-xl border border-slate-700/80 bg-slate-950/80 shadow-md">
                            <table {...props} className="w-full text-[11px] text-left divide-y divide-slate-800 border-collapse" />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead {...props} className="bg-slate-900/90 text-emerald-400 font-bold uppercase tracking-wider text-[10px]" />
                        ),
                        tbody: ({ node, ...props }) => (
                          <tbody {...props} className="divide-y divide-slate-800/60 bg-slate-950/40" />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr {...props} className="hover:bg-slate-800/40 transition-colors" />
                        ),
                        th: ({ node, ...props }) => (
                          <th {...props} className="px-3 py-2 font-bold text-slate-200 border-b border-slate-700 whitespace-nowrap" />
                        ),
                        td: ({ node, ...props }) => (
                          <td {...props} className="px-3 py-2 text-slate-300 align-top leading-normal" />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline font-bold break-all"
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong {...props} className="font-bold text-white" />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc pl-4 space-y-1 my-2 text-slate-200" />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} className="list-decimal pl-4 space-y-1 my-2 text-slate-200" />
                        ),
                        li: ({ node, ...props }) => (
                          <li {...props} className="text-slate-300" />
                        ),
                        p: ({ node, ...props }) => (
                          <p {...props} className="my-1.5 leading-relaxed" />
                        ),
                        code: ({ node, ...props }) => (
                          <code {...props} className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono" />
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {/* INLINE PRODUCT CARDS WITH ADD TO CART */}
                    {detectedProds.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                        {detectedProds.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md hover:border-emerald-400/50 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 object-contain rounded-xl bg-slate-800/90 p-1 shrink-0 border border-slate-700"
                              />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">{prod.brand}</span>
                                <p className="text-[11px] font-bold text-white truncate leading-tight">{prod.name}</p>
                                <p className="text-[10px] font-black text-emerald-300 mt-0.5">
                                  {prod.price.toLocaleString()} PKR
                                  {prod.stock > 0 && (
                                    <span className="text-[9px] font-normal text-emerald-400 ml-1.5">• In Stock</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleInlineAddToCart(prod)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                                addedItems[prod.id]
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/25'
                              }`}
                            >
                              {addedItems[prod.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CITATION SOURCES PILLS */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1"
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
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-opacity"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* SUGGESTED ACTION CHIPS */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action)}
                        className="text-[10px] font-bold bg-slate-900/90 hover:bg-emerald-950/60 text-emerald-300 hover:text-white border border-slate-800 hover:border-emerald-500 px-3 py-1.5 rounded-full transition-all text-left shadow-xs"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })}

            {loading && (
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800/90 text-slate-300 text-xs px-4 py-3 rounded-2xl w-fit shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="font-medium">Nova AI is evaluating page context & database...</span>
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
            className="p-3.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2.5"
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
              className="flex-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-2xl transition-all shrink-0 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
