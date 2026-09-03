'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  CheckCircle, 
  ChevronRight,
  ArrowRight,
  Zap,
  DollarSign
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Ali Raza',
    email: user?.email || 'ali.raza@example.pk',
    phone: user?.phone || '+92 300 1234567',
    address: user?.address || 'House 42-B, Street 9, F-7/2',
    city: user?.city || 'Islamabad',
    courier: 'Leopard Express (1-2 Business Days)',
    paymentMethod: 'Cash on Delivery (COD)'
  });

  const [placing, setPlacing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add some items before checking out.</p>
        <Link href="/products" className="mt-4 inline-block bg-[#008ECC] text-white px-5 py-2.5 rounded-xl font-bold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);

    // Generate Order Record
    const orderId = `NC-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `LP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customer_id: user?.id || 'CUS-001',
      customer_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      shipping_address: `${formData.address}, ${formData.city}`,
      courier: formData.courier.split(' ')[0],
      tracking_number: trackingNumber,
      status: 'Processing',
      total_amount: totalAmount,
      created_at: new Date().toISOString(),
      items: items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        image: i.product.image
      }))
    };

    // Save to local storage for instant live tracking across pages
    const existingOrders = JSON.parse(localStorage.getItem('novacart_orders') || '[]');
    localStorage.setItem('novacart_orders', JSON.stringify([newOrder, ...existingOrders]));

    // Attempt FastAPI sync if available
    try {
      await fetch('http://localhost:8000/api/v1/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      // Graceful fallback to client storage
    }

    setTimeout(() => {
      setPlacing(false);
      setCompletedOrder(newOrder);
      clearCart();
    }, 1200);
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm animate-in zoom-in-50 duration-300">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
          Thank you for your purchase!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Your order has been received and is being prepared for dispatch.
        </p>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm space-y-3">
          <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Order Reference</span>
              <strong className="text-lg text-[#008ECC] font-black">{completedOrder.id}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
              <strong className="text-lg text-slate-900 font-black">{completedOrder.total_amount.toLocaleString()} PKR</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-slate-400 block font-semibold">Delivery Address:</span>
              <p className="text-slate-700 font-medium">{completedOrder.shipping_address}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Courier & Tracking:</span>
              <p className="text-slate-700 font-medium">{completedOrder.courier} ({completedOrder.tracking_number})</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orders"
            className="w-full sm:w-auto bg-[#008ECC] hover:bg-[#007BB0] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            Track in My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6">
        Secure <span className="text-[#008ECC]">Checkout</span>
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: SHIPPING & PAYMENT FORM */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <MapPin className="w-4 h-4 text-[#008ECC]" />
              1. Delivery & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008ECC]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008ECC]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008ECC]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008ECC]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008ECC]"
                />
              </div>
            </div>
          </div>

          {/* 2. SHIPPING METHOD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Truck className="w-4 h-4 text-[#008ECC]" />
              2. Shipping Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Leopard Express (1-2 Business Days)', sub: 'Fast Express with SMS Tracking', free: true },
                { name: 'TCS Standard Shipping (2-3 Business Days)', sub: 'Standard Ground Delivery', free: true }
              ].map((c) => (
                <label
                  key={c.name}
                  onClick={() => setFormData({ ...formData, courier: c.name })}
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    formData.courier === c.name
                      ? 'border-[#008ECC] bg-[#008ECC]/5 shadow-sm ring-1 ring-[#008ECC]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{c.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">{c.sub}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. PAYMENT METHOD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <CreditCard className="w-4 h-4 text-[#008ECC]" />
              3. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Cash on Delivery (COD)', desc: 'Pay cash when item is delivered' },
                { name: 'Direct Bank Transfer', desc: 'Meezan / HBL / SCB' },
                { name: 'EasyPaisa / JazzCash', desc: 'Instant mobile wallet payment' }
              ].map((p) => (
                <label
                  key={p.name}
                  onClick={() => setFormData({ ...formData, paymentMethod: p.name })}
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    formData.paymentMethod === p.name
                      ? 'border-[#008ECC] bg-[#008ECC]/5 shadow-sm ring-1 ring-[#008ECC]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{p.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY & PLACE ORDER */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
            Review Items ({items.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 text-xs">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-contain bg-slate-50 p-1 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{product.name}</p>
                  <p className="text-slate-400">Qty: {quantity} × {product.price.toLocaleString()} PKR</p>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {(product.price * quantity).toLocaleString()} PKR
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">{totalAmount.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping:</span>
              <span className="text-emerald-600 font-bold">FREE Express</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Payable:</span>
            <span className="text-2xl font-black text-[#008ECC]">
              {totalAmount.toLocaleString()} PKR
            </span>
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full py-4 bg-[#008ECC] hover:bg-[#007BB0] disabled:opacity-50 text-white rounded-xl font-black text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            {placing ? 'Processing Order...' : 'Confirm & Place Order'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
