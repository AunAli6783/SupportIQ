'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#0F1424] text-white mt-16 pt-16 pb-12 border-t border-slate-800 overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#008ECC] to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#008ECC]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* VALUE PROPOSITION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-[#008ECC]/20 border border-[#008ECC]/30 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#008ECC]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Express Delivery</p>
              <p className="text-xs text-slate-400 mt-0.5">Leopard & TCS 24-48h Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">100% Genuine Tech</p>
              <p className="text-xs text-slate-400 mt-0.5">Official Brand Sealed Boxes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">30-Day Easy Returns</p>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Nova AI Support 24/7</p>
              <p className="text-xs text-slate-400 mt-0.5">Context-aware instant answers</p>
            </div>
          </div>
        </div>

        {/* MAIN FOOTER COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12">
          
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ECC] to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-500/20">
                N
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Nova<span className="text-[#008ECC]">Cart</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Pakistan&apos;s leading authorized retailer for 2024–2026 AI laptops, flagship smartphones, and professional creator hardware. Grounded by the SupportIQ AI Customer Engine.
            </p>
            
            <div className="mt-2 flex flex-col gap-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#008ECC]" />
                <span>Customer Care: +92 (051) 918-2132</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#008ECC]" />
                <span>Support: care@novacart.pk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#008ECC]" />
                <span>NovaCart Tower, Blue Area, Islamabad, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Popular Hardware</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/products?category=Smartphones" className="hover:text-[#008ECC] transition-colors flex items-center gap-1.5"><span>Smartphones & Flagships</span></Link></li>
              <li><Link href="/products?category=Laptops" className="hover:text-[#008ECC] transition-colors flex items-center gap-1.5"><span>AI Laptops & Workstations</span></Link></li>
              <li><Link href="/products?category=Laptops" className="hover:text-[#008ECC] transition-colors flex items-center gap-1.5"><span>RTX 4080 / 4090 Systems</span></Link></li>
              <li><Link href="/products?category=Audio+%26+Wearables" className="hover:text-[#008ECC] transition-colors flex items-center gap-1.5"><span>Noise-Canceling Audio</span></Link></li>
              <li><Link href="/products?category=Tablets+%26+Displays" className="hover:text-[#008ECC] transition-colors flex items-center gap-1.5"><span>OLED Tablets & Displays</span></Link></li>
            </ul>
          </div>

          {/* Customer Services */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Customer Trust & Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/orders" className="hover:text-[#008ECC] transition-colors">Real-Time Order Tracking & Stepper</Link></li>
              <li><Link href="/products" className="hover:text-[#008ECC] transition-colors">30-Day Return & Replacement Policy</Link></li>
              <li><Link href="/products" className="hover:text-[#008ECC] transition-colors">Official AppleCare & Samsung Care+ Info</Link></li>
              <li><Link href="/login" className="hover:text-[#008ECC] transition-colors">Customer Profile & Address Manager</Link></li>
            </ul>

            {/* Newsletter / Stay in the Loop */}
            <div className="mt-5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white block">Tech Launch Alerts</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Receive drop notifications for 2026 releases.</span>
              <div className="flex gap-2 mt-2">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-[#008ECC]" 
                />
                <button className="bg-[#008ECC] hover:bg-[#007BB0] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 NovaCart Tech Retail Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              256-Bit SSL Encrypted Checkout
            </span>
            <span>•</span>
            <span className="text-sky-400 font-medium">Powered by SupportIQ AI Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
