'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  RotateCcw, 
  XCircle, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SupportCenterPage() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [actionOutput, setActionOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setActionOutput(null);
    try {
      const res = await fetch(`${API_URL}/store/orders/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          customer_id: user?.id,
          reason: cancelReason || 'Customer requested self-service cancellation'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionOutput(`SUCCESS: Order ${orderId} has been cancelled. Inventory has been automatically replenished.`);
      } else {
        setActionOutput(`ERROR: ${data.detail || 'Failed to cancel order'}`);
      }
    } catch (err) {
      setActionOutput('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !returnReason) return;
    setLoading(true);
    setActionOutput(null);
    try {
      const res = await fetch(`${API_URL}/store/orders/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          customer_id: user?.id || 'CUS-001',
          reason: returnReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionOutput(`SUCCESS: Return Authorization Approved! RMA Number: ${data.return_request?.id}. Prepaid Leopard Courier pickup label dispatched to email.`);
      } else {
        setActionOutput(`ERROR: ${data.detail || 'Could not process return'}`);
      }
    } catch (err) {
      setActionOutput('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !newAddress) return;
    setLoading(true);
    setActionOutput(null);
    try {
      const res = await fetch(`${API_URL}/store/orders/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          new_address: newAddress,
          customer_id: user?.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionOutput(`SUCCESS: Shipping destination on Order ${orderId} updated to: ${newAddress}`);
      } else {
        setActionOutput(`ERROR: ${data.detail || 'Could not update address'}`);
      }
    } catch (err) {
      setActionOutput('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#008ECC] text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Self-Service & Policy Grounding
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          NovaCart Resolution Hub
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Manage your orders, initiate automated RMA returns, update delivery addresses, or chat with our 24/7 AI pair assistant.
        </p>
      </div>

      {actionOutput && (
        <div className={`mb-8 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300 ${
          actionOutput.startsWith('SUCCESS') 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <PackageCheck className="w-5 h-5 shrink-0" />
          <span>{actionOutput}</span>
        </div>
      )}

      {/* 3 CORE ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* 1. CANCEL ORDER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cancel Order</h3>
            <p className="text-xs text-slate-500 mt-1">
              Cancel un-dispatched orders with automated stock replenishment and instant refund release.
            </p>
            <form onSubmit={handleCancel} className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Order ID (e.g. NC-10002)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC] font-medium"
                required
              />
              <input
                type="text"
                placeholder="Reason (Optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </form>
          </div>
        </div>

        {/* 2. RMA RETURN */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Request Return (RMA)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Eligible within 30 days of delivery. Instant automated return authorization and courier pickup label.
            </p>
            <form onSubmit={handleReturn} className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Order ID (e.g. NC-10001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC] font-medium"
                required
              />
              <input
                type="text"
                placeholder="Return Reason (e.g. Defective screen, Unopened)"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC]"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Generate RMA Authorization'}
              </button>
            </form>
          </div>
        </div>

        {/* 3. ADDRESS REDIRECT */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-[#008ECC] flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Update Address</h3>
            <p className="text-xs text-slate-500 mt-1">
              Redirect order destination address before courier dispatch with zero delays.
            </p>
            <form onSubmit={handleAddressUpdate} className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Order ID (e.g. NC-10002)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC] font-medium"
                required
              />
              <input
                type="text"
                placeholder="New Delivery Address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008ECC]"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#008ECC] hover:bg-[#007BB0] text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Destination'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POLICY GUARANTEES CALLOUT */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-[#008ECC] font-bold">Guaranteed Protection</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Official 30-Day Hassle-Free Returns</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            All NovaCart flagship purchases include official brand manufacturer warranties, free courier returns, and direct human engineer escalation when needed.
          </p>
        </div>
        <Link
          href="/orders"
          className="bg-[#008ECC] hover:bg-sky-500 text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-sky-500/30 flex items-center gap-2 shrink-0"
        >
          View Active Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
