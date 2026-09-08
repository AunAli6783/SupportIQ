'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white mt-16 pt-16 pb-12 border-t border-slate-800 overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* VALUE PROPOSITION GRID (Figma Swoo style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Free Shipping Over $199</p>
              <p className="text-xs text-slate-400 mt-0.5">Nationwide Express Courier</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">100% Genuine Tech</p>
              <p className="text-xs text-slate-400 mt-0.5">Authorized Official Retailer</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">30 Days Money Back</p>
              <p className="text-xs text-slate-400 mt-0.5">Guaranteed Customer Satisfaction</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Swoo AI Support 24/7</p>
              <p className="text-xs text-slate-400 mt-0.5">Hotline: (025) 3886 25 16</p>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12">
          
          {/* Brand & Contact */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight leading-none">
                  SWOO
                </span>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-0.5">
                  TECH MART
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Your premium destination for 2026 flagship tech products: Apple iPhones, Samsung Galaxy AI, MacBook Pro M4 Max, ROG Gaming laptops, and noise-cancelling audio gear.
            </p>
            
            <div className="mt-2 flex flex-col gap-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Hotline 24/7: <strong>(025) 3886 25 16</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Support: support@swootechmart.com</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Popular Hardware</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/products?category=Smartphones" className="hover:text-emerald-400 transition-colors">Smartphones & Flagships</Link></li>
              <li><Link href="/products?category=Laptops" className="hover:text-emerald-400 transition-colors">MacBook & AI Laptops</Link></li>
              <li><Link href="/products?category=Audio+%26+Wearables" className="hover:text-emerald-400 transition-colors">Noise-Cancelling Audio</Link></li>
              <li><Link href="/products?category=Tablets+%26+Displays" className="hover:text-emerald-400 transition-colors">Tandem OLED Tablets</Link></li>
              <li><Link href="/products?category=Accessories" className="hover:text-emerald-400 transition-colors">GaN Fast Chargers</Link></li>
            </ul>
          </div>

          {/* Customer Services & Protected Orders */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Customer Account & Orders</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/orders" className="hover:text-emerald-400 transition-colors">Track Isolated Customer Orders</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Customer Profile & Sign In</Link></li>
              <li><Link href="/support" className="hover:text-emerald-400 transition-colors">Resolution Hub & AI Assistant</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-400 transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SWOO TECH MART. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Shipping & Refunds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
