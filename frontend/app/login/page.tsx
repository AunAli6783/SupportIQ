'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { User, ShieldCheck, Check, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAs } = useAuth();

  const handleSelectUser = (id: string) => {
    loginAs(id);
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-14 h-14 bg-gradient-to-tr from-[#008ECC] to-sky-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20 font-black text-2xl">
        N
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
        Sign in to <span className="text-[#008ECC]">NovaCart</span>
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Select a demo customer profile to test personalized live orders, context-aware AI, and return permissions.
      </p>

      <div className="mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-left space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Available Demo Profiles
        </h3>

        {DEMO_USERS.map((u) => {
          const isSelected = user?.id === u.id;
          return (
            <div
              key={u.id}
              onClick={() => handleSelectUser(u.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-[#008ECC] bg-[#008ECC]/5 ring-1 ring-[#008ECC] shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-[#008ECC] font-bold text-sm flex items-center justify-center border border-sky-200">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{u.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {u.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{u.email}</p>
                  <p className="text-[11px] text-slate-400">{u.city}</p>
                </div>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <button className="text-xs font-bold text-[#008ECC] hover:underline flex items-center gap-0.5">
                    Switch <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>JWT Simulated Customer Authentication Enabled</span>
      </div>
    </div>
  );
}
