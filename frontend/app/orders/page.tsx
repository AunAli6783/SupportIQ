'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Bot, 
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Lock,
  User,
  UserCheck
} from 'lucide-react';

const INITIAL_ORDERS = [
  {
    id: 'NC-10001',
    customer_id: 'CUS-001',
    status: 'Delivered',
    total_amount: 485000,
    total_amount_usd: 1899,
    shipping_address: 'House 42-B, Street 9, F-7/2, Islamabad',
    tracking_number: 'LP-884920',
    courier: 'Leopard Express',
    created_at: '2026-08-20T10:30:00Z',
    items: [
      {
        name: 'Apple MacBook Pro 16" (M4 Max Silicon Power)',
        quantity: 1,
        price: 485000,
        price_usd: 1899,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'NC-10002',
    customer_id: 'CUS-001',
    status: 'Processing',
    total_amount: 395000,
    total_amount_usd: 1299,
    shipping_address: 'House 42-B, Street 9, F-7/2, Islamabad',
    tracking_number: 'LP-910482',
    courier: 'Leopard Express',
    created_at: '2026-09-02T14:15:00Z',
    items: [
      {
        name: 'Samsung Galaxy S25 Ultra 5G (Galaxy AI)',
        quantity: 1,
        price: 395000,
        price_usd: 1299,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'NC-10003',
    customer_id: 'CUS-002',
    status: 'Shipped',
    total_amount: 440000,
    total_amount_usd: 1699,
    shipping_address: 'Apartment 402, Creek Vistas, Phase 8, DHA, Karachi',
    tracking_number: 'TCS-771923',
    courier: 'TCS Express',
    created_at: '2026-09-01T09:00:00Z',
    items: [
      {
        name: 'Dell XPS 16 (2026 Core Ultra 7 OLED)',
        quantity: 1,
        price: 440000,
        price_usd: 1699,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'NC-10004',
    customer_id: 'CUS-003',
    status: 'Processing',
    total_amount: 127000,
    total_amount_usd: 438,
    shipping_address: 'Plot 18, Sector Y, Phase 3, DHA, Lahore',
    tracking_number: 'TCS-992104',
    courier: 'TCS Express',
    created_at: '2026-09-04T11:20:00Z',
    items: [
      {
        name: 'Boso Over-Ear Wireless Headphone (3D Spatial Audio)',
        quantity: 1,
        price: 89000,
        price_usd: 299,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80'
      },
      {
        name: 'Anker Prime 240W GaN Desktop Charging Station',
        quantity: 1,
        price: 38000,
        price_usd: 139,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export default function OrdersPage() {
  const { user, loginAs, formatPrice } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('swoo_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrders([...parsed, ...INITIAL_ORDERS.filter((o) => !parsed.some((p: any) => p.id === o.id))]);
      } catch (e) {
        setOrders(INITIAL_ORDERS);
      }
    } else {
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  // If user is not authenticated, show strict access restriction
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          Sign In Required
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Your orders, tracking information, and return permissions are private and strictly isolated to your verified customer account.
        </p>
        
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Sign In to Access Your Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
          >
            Return to Store Home
          </Link>
        </div>
      </div>
    );
  }

  // Strict Per-User Isolation: filter orders strictly by active user ID
  const customerOrders = orders.filter((o) => o.customer_id === user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">Delivered</span>;
      case 'Shipped':
        return <span className="text-xs font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-200">In Transit (Shipped)</span>;
      case 'Processing':
        return <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">Processing & Packaging</span>;
      case 'Cancelled':
        return <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200">Cancelled</span>;
      default:
        return <span className="text-xs font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      
      {/* 1. HEADER & ACTIVE CUSTOMER ISOLATION BANNER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Customer Orders & Tracking
            </h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {user.id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Strictly isolated private order history for <strong className="text-slate-800">{user.name}</strong> ({user.email})
          </p>
        </div>

        {/* Quick Customer Switcher for live pair testing */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-400 font-bold text-[10px] uppercase pl-2">Switch:</span>
          {DEMO_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => loginAs(u.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                user.id === u.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {u.name.split(' ')[0]} ({u.id})
            </button>
          ))}
        </div>
      </div>

      {/* 2. ORDER LISTING */}
      {customerOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800">No Orders Placed Yet for {user.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            No active or past purchases found for account {user.id}. Any orders placed will appear here exclusively for this account.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore 2026 Tech Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => {
            const formattedTotal = formatPrice(order.total_amount, order.total_amount_usd);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-500 transition-all p-5"
              >
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm">
                      #
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Amount</span>
                    <span className="text-base font-black text-slate-900">{formattedTotal}</span>
                  </div>
                </div>

                {/* Items & Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
                  {/* Item List */}
                  <div className="md:col-span-8 space-y-3">
                    {order.items.map((item: any, i: number) => {
                      const itemFormattedPrice = formatPrice(item.price, item.price_usd);
                      return (
                        <div key={i} className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                            <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {itemFormattedPrice}</p>
                          </div>
                          <span className="text-xs font-black text-slate-900">
                            {formatPrice(item.price * item.quantity, (item.price_usd || Math.round(item.price / 280)) * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier & Tracking Details */}
                  <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-2">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Courier Tracking</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">Courier: <strong className="text-slate-800">{order.courier}</strong></p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">Tracking #: <strong className="text-emerald-700">{order.tracking_number}</strong></p>
                      <p className="text-slate-400 text-[10px] mt-2 line-clamp-2">Destination: {order.shipping_address}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80">
                      <Link
                        href={`/support?q=${encodeURIComponent(`Check status of order ${order.id}`)}`}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI Agent about this order</span>
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
