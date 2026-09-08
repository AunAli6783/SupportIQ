'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Lock, 
  Mail, 
  UserCheck,
  Package
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAs, loginWithCustom } = useAuth();
  
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');

  const handleSelectUser = (id: string) => {
    loginAs(id);
    router.push('/orders');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim() && customEmail.trim()) {
      loginWithCustom({
        name: customName.trim(),
        email: customEmail.trim(),
      });
      router.push('/orders');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      
      {/* SWOO TECH MART Circular Green Logo */}
      <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md font-black text-3xl">
        S
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
        Sign In to <span className="text-emerald-600">SWOO TECH MART</span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
        Select or enter your customer account to access your strictly isolated orders, warranties, and order tracking.
      </p>

      {/* TABS: DEMO PROFILES OR CUSTOM LOGIN */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'demo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Quick Demo Accounts
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'custom'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Custom Customer Sign In
        </button>
      </div>

      {activeTab === 'demo' ? (
        /* DEMO CUSTOMER CARDS */
        <div className="mt-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-left space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Select Verified Customer Profile
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Strict Access Isolation
            </span>
          </div>

          {DEMO_USERS.map((u) => {
            const isSelected = user?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-300">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{u.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {u.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    <p className="text-[11px] text-slate-400">{u.city}, Pakistan</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Logged In
                    </span>
                  ) : (
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <span>Select</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CUSTOM LOGIN FORM */
        <form onSubmit={handleCustomLogin} className="mt-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs text-left space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="tariq@example.pk"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Sign In to SWOO TECH MART</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Strict Per-Customer Ownership & Access Verification Active</span>
      </div>
    </div>
  );
}
