'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  MapPin, 
  Truck, 
  ShieldCheck,
  Package,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, totalAmount } = useCart();
  const { user, loginAs } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const categories = [
    { name: 'All Hardware', path: '/products', icon: '✨' },
    { name: 'Smartphones & Flagships', path: '/products?category=Smartphones', icon: '📱' },
    { name: 'AI Laptops & Workstations', path: '/products?category=Laptops', icon: '💻' },
    { name: 'Audio & Creator Wearables', path: '/products?category=Audio+%26+Wearables', icon: '🎧' },
    { name: 'OLED Displays & Tablets', path: '/products?category=Tablets+%26+Displays', icon: '🖥️' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200/80' 
        : 'bg-white shadow-sm border-b border-slate-100'
    }`}>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#151C30] text-[11px] text-slate-300 py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008ECC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008ECC]"></span>
              </span>
              <Truck className="w-3.5 h-3.5 text-[#008ECC]" />
              Free Express Courier Delivery Nationwide (Orders &gt; 25,000 PKR)
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Official 2024–2026 Authorised Retailer
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#008ECC]" />
              Shipping to: <strong className="text-white ml-0.5">{user?.city || 'Pakistan'}</strong>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link 
              href="/orders" 
              className="text-sky-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 group"
            >
              <Package className="w-3.5 h-3.5 text-[#008ECC] group-hover:scale-110 transition-transform" />
              <span>Track Orders</span>
            </Link>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link 
              href="/support" 
              className="text-emerald-400 hover:text-white font-bold transition-colors flex items-center gap-1.5 group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Resolution Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
        {/* BRAND LOGO WITH GLOW */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#008ECC] via-sky-500 to-[#212844] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-all duration-300">
              N
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Nova<span className="text-[#008ECC]">Cart</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1 mt-0.5">
              <span>Next-Gen Tech</span>
              <span className="text-sky-500 font-extrabold">• AI 2026</span>
            </span>
          </div>
        </Link>

        {/* MODERN SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center">
          <div className="w-full flex items-center bg-slate-50/90 hover:bg-white focus-within:bg-white rounded-2xl border border-slate-200/90 focus-within:border-[#008ECC] focus-within:ring-4 focus-within:ring-sky-500/10 shadow-sm transition-all overflow-hidden p-1">
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-4 h-4 text-[#008ECC]" />
            </div>
            <input
              type="text"
              placeholder="Search MacBook M3, Galaxy S25 Ultra, RTX 4090, Dell XPS, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="w-full bg-transparent px-2 py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-mono text-slate-500 mr-2 border border-slate-200">
              <span>AI Search</span>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#008ECC] to-sky-600 hover:from-[#007BB0] hover:to-sky-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          {/* USER ACCOUNT SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-50 border border-slate-200/80 hover:border-sky-200 transition-all text-left shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-100 to-sky-200 border border-sky-300/80 flex items-center justify-center text-[#008ECC] font-bold text-xs shadow-inner">
                {user ? user.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account</span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                  {user ? user.name : 'Sign In'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* DEMO USER SWITCHER MODAL */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                  <p className="text-[10px] font-bold text-[#008ECC] uppercase tracking-wider">Active Customer</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Quick Demo Switcher</p>
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        loginAs(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        user?.id === u.id
                          ? 'bg-[#008ECC] text-white font-bold shadow-md shadow-sky-500/25'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold leading-tight">{u.name}</span>
                        <span className={`text-[10px] ${user?.id === u.id ? 'text-sky-100' : 'text-slate-400'}`}>{u.city}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        user?.id === u.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {u.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <Link
                    href="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-[#008ECC] hover:bg-sky-50 flex items-center gap-2 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    <span>View Customer Orders</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SHOPPING CART BUTTON */}
          <Link
            href="/cart"
            className="flex items-center gap-3 bg-gradient-to-r from-[#008ECC]/10 to-sky-500/10 hover:from-[#008ECC]/20 hover:to-sky-500/20 text-[#008ECC] px-4 py-2 rounded-2xl border border-sky-300/40 transition-all font-semibold shadow-xs group"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#008ECC] group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-gradient-to-r from-[#008ECC] to-sky-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Bag</span>
              <span className="text-xs font-black text-slate-900 leading-tight">
                {totalAmount > 0 ? `${totalAmount.toLocaleString()} PKR` : '0 PKR'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. CATEGORY NAVIGATION BAR */}
      <div className="bg-slate-50/70 border-t border-slate-100/80 px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = 
              cat.path === '/products' 
                ? pathname === '/products' && !cat.path.includes('?') 
                : pathname === '/products';
            return (
              <Link
                key={cat.name}
                href={cat.path}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#008ECC] text-white shadow-sm shadow-sky-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/60 shadow-2xs'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
