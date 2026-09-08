'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Check, 
  Mail, 
  Lock, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMessage, 
    loginAs, 
    loginWithCustom,
    user 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSelectDemo = (userId: string) => {
    loginAs(userId);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim() && customEmail.trim()) {
      loginWithCustom({
        name: customName.trim(),
        email: customEmail.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-xl shadow-md">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight leading-none">SWOO TECH MART</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">AUTHENTICATION</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                Verified Customer Access Isolation
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Notification Message */}
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Sign In Required to Continue
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                {authModalMessage || 'In real e-commerce apps, shopping cart items, orders, and warranties are tied to a verified customer account.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'demo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⚡ 1-Click Verified Accounts
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✍️ Custom Customer Sign In
            </button>
          </div>

          {activeTab === 'demo' ? (
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Select a Verified Demo Profile:
              </span>
              {DEMO_USERS.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectDemo(u.id)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-300">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {u.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {u.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{u.email} • {u.city}</p>
                    </div>
                  </div>

                  <button className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-all flex items-center gap-1">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Farhan Ali"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="farhan@example.pk"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue to Shopping Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict User Order & Cart Security Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}