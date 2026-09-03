'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Bot, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

const INITIAL_ORDERS = [
  {
    id: 'NC-10001',
    customer_id: 'CUS-001',
    status: 'Delivered',
    total_amount: 485000,
    shipping_address: 'House 42-B, Street 9, F-7/2, Islamabad',
    tracking_number: 'LP-884920',
    courier: 'Leopard Express',
    created_at: '2026-08-20T10:30:00Z',
    items: [
      {
        name: 'Apple MacBook Pro 16" (M3 Max)',
        quantity: 1,
        price: 485000,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'NC-10002',
    customer_id: 'CUS-001',
    status: 'Processing',
    total_amount: 395000,
    shipping_address: 'House 42-B, Street 9, F-7/2, Islamabad',
    tracking_number: 'LP-910482',
    courier: 'Leopard Express',
    created_at: '2026-09-02T14:15:00Z',
    items: [
      {
        name: 'Samsung Galaxy S25 Ultra 5G',
        quantity: 1,
        price: 395000,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'NC-10003',
    customer_id: 'CUS-002',
    status: 'Shipped',
    total_amount: 440000,
    shipping_address: 'Apartment 402, Creek Vistas, Phase 8, DHA, Karachi',
    tracking_number: 'TCS-771923',
    courier: 'TCS Express',
    created_at: '2026-09-01T09:00:00Z',
    items: [
      {
        name: 'Dell XPS 16 (2025/2026 Core Ultra 7)',
        quantity: 1,
        price: 440000,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('novacart_orders');
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

  // Filter orders by active customer ID
  const customerOrders = orders.filter((o) => o.customer_id === (user?.id || 'CUS-001'));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">Delivered</span>;
      case 'Shipped':
        return <span className="text-xs font-bold bg-sky-50 text-[#008ECC] px-2.5 py-1 rounded-lg border border-sky-200">In Transit (Shipped)</span>;
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-[#008ECC]" />
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing order history for <strong className="text-slate-800">{user?.name} ({user?.id})</strong>
          </p>
        </div>

        <Link
          href="/products"
          className="bg-[#008ECC] hover:bg-[#007BB0] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 w-fit"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Store
        </Link>
      </div>

      {customerOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found for {user?.name}</h3>
          <p className="text-xs text-slate-400 mt-1">You haven&apos;t placed any orders with this profile yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-[#008ECC] text-white px-5 py-2 rounded-xl text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* ORDER HEADER */}
              <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Order Placed</span>
                    <strong className="text-slate-800">{new Date(order.created_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Total Amount</span>
                    <strong className="text-slate-900 font-bold">{order.total_amount.toLocaleString()} PKR</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Ship To</span>
                    <span className="text-slate-700 font-medium truncate max-w-[180px] block">{order.shipping_address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#008ECC] bg-[#008ECC]/10 px-2.5 py-1 rounded-lg">
                    {order.id}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* TRACKING STEPPER */}
              <div className="px-6 py-4 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between text-xs max-w-2xl mx-auto py-2">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      ✓
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Order Placed</span>
                  </div>

                  <div className={`flex-1 h-1 mx-2 ${order.status !== 'Cancelled' ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-[#008ECC] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Packaging</span>
                  </div>

                  <div className={`flex-1 h-1 mx-2 ${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-[#008ECC]' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-[#008ECC] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">In Transit</span>
                  </div>

                  <div className={`flex-1 h-1 mx-2 ${order.status === 'Delivered' ? 'bg-emerald-400' : 'bg-slate-200'}`} />

                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Delivered</span>
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS LIST */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-slate-50 p-1 rounded-xl shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-400">Courier: {order.courier} | Tracking: {order.tracking_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{item.price?.toLocaleString()} PKR</span>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
