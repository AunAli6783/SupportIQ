'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Phone, 
  Heart,
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Package, 
  Menu,
  LogOut,
  ArrowRight,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, totalAmount, totalAmountUsd } = useCart();
  const { user, currency, setCurrency, formatPrice, loginAs, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('All Categories');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const cartDisplayTotal = currency === 'USD' 
    ? `$${(totalAmountUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${(totalAmount || 0).toLocaleString()} PKR`;

  return (
    <header className="w-full bg-white text-slate-800 font-sans border-b border-slate-200">
      
      {/* 1. TOP HOTLINE & ANNOUNCEMENT BAR (Figma visual match) */}
      <div className="bg-slate-100/90 text-xs text-slate-600 border-b border-slate-200/80 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          
          {/* Left: Hotline 24/7 */}
          <div className="flex items-center gap-2 font-medium">
            <span className="text-slate-500">Hotline 24/7</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 hover:text-emerald-700 transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>(025) 3886 25 16</span>
            </div>
          </div>

          {/* Right: Sell on Swoo | Order Tracking | USD/PKR | Language */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/products" className="hover:text-emerald-600 transition-colors hidden sm:inline">
              Sell on Swoo
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link href="/orders" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Order Tracking</span>
            </Link>
            <span className="text-slate-300">|</span>

            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-1 text-slate-700 font-bold hover:text-emerald-600 transition-colors py-0.5"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCurrencyMenu && (
                <div className="absolute right-0 mt-1 w-24 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { setCurrency('USD'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold ${currency === 'USD' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => { setCurrency('PKR'); setShowCurrencyMenu(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold ${currency === 'PKR' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    PKR (₨)
                  </button>
                </div>
              )}
            </div>

            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-emerald-600">
              <span>Eng</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR ROW (SWOO TECH MART LOGO, NAV LINKS, USER & CART) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-6">
        
        {/* SWOO TECH MART LOGO */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              SWOO
            </span>
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-0.5">
              TECH MART
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS (Figma: HOMES, PAGES, PRODUCTS, CONTACT) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-black tracking-wider uppercase text-slate-700">
          <Link href="/" className="flex items-center gap-1 text-emerald-600 font-extrabold hover:text-emerald-700 transition-colors">
            <span>HOMES</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Link>
          <Link href="/products" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <span>PAGES</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Link>
          <Link href="/products" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <span>PRODUCTS</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Link>
          <Link href="/support" className="hover:text-emerald-600 transition-colors">
            <span>CONTACT</span>
          </Link>
        </nav>

        {/* RIGHT CONTROLS: 4 CIRCULAR ACTIONS AS SHOWN IN FIGMA */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Circle 1: Quick Search / Discovery Circle Button */}
          <Link 
            href="/products"
            title="Browse Catalog"
            className="w-10 h-10 rounded-full bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors hidden sm:flex"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Circle 2: Wishlist Heart Circle */}
          <Link 
            href="/products" 
            title="Wishlist"
            className="relative w-10 h-10 rounded-full bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Circle 3: User Login / Profile Circle + Welcome Text */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">WELCOME</span>
                  <span className="text-xs font-black text-slate-900 leading-tight mt-1 truncate max-w-[120px]">
                    {user.name.toUpperCase()}
                  </span>
                </div>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">WELCOME</span>
                  <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 leading-tight mt-1">
                    LOG IN / REGISTER
                  </span>
                </div>
              </Link>
            )}

            {/* Account Switcher & Order Protection Dropdown */}
            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Logged In Customer</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
                      {user.id}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Switch Customer Account</p>
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        loginAs(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        user?.id === u.id
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold leading-tight">{u.name}</span>
                        <span className={`text-[10px] ${user?.id === u.id ? 'text-emerald-100' : 'text-slate-400'}`}>{u.city}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        user?.id === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <Link
                    href="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>My Isolated Orders</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-slate-400" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Circle 4: Cart Bag Circle with Green Count Badge + Cart Total */}
          <Link
            href="/cart"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="relative w-10 h-10 rounded-full bg-[#F1F5F9] group-hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors">
              <ShoppingCart className="w-4 h-4 text-slate-800 group-hover:text-emerald-600" />
              {itemCount > 0 && (
                <span className="absolute -bottom-0.5 -right-0.5 bg-[#16A34A] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-in zoom-in-50 duration-200">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">CART</span>
              <span className="text-xs font-black text-slate-900 leading-tight mt-1">
                {cartDisplayTotal}
              </span>
            </div>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. FIGMA GREEN ACTION & VALUE PROPS BAR (#16A34A) */}
      <div className="bg-[#16A34A] text-white px-4 sm:px-8 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Pill Search Container (Figma exact: rounded-full with All Categories ▾ | Search anything... | 🔍) */}
          <div className="w-full md:w-auto flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="w-full flex items-center bg-white rounded-full px-3 py-1 shadow-inner">
              
              {/* Category dropdown inside search pill */}
              <div className="flex items-center gap-1 px-2 text-xs font-bold text-slate-700 shrink-0 cursor-pointer">
                <span>{selectedSearchCat}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Vertical divider */}
              <div className="h-4 w-px bg-slate-300 mx-2" />

              {/* Search text input */}
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />

              {/* Search Icon button */}
              <button
                type="submit"
                className="p-1.5 text-slate-600 hover:text-emerald-600 transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Value Props (Figma exact match): FREE SHIPPING OVER $199 | 30 DAYS MONEY BACK | 100% SECURE PAYMENT */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-wider text-white">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-white" />
              <span>FREE SHIPPING OVER $199</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-white" />
              <span>30 DAYS MONEY BACK</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>100% SECURE PAYMENT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold hover:text-emerald-400">
            HOMES
          </Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold hover:text-emerald-400">
            PRODUCTS
          </Link>
          <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold hover:text-emerald-400">
            MY ORDERS
          </Link>
          <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold hover:text-emerald-400">
            CONTACT & SUPPORT
          </Link>
        </div>
      )}
    </header>
  );
}
