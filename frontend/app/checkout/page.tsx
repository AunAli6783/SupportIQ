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
  DollarSign,
  Lock
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, totalAmountUsd, clearCart } = useCart();
  const { user, formatPrice, currency, openAuthModal } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    courier: 'Leopard Express (1-2 Business Days)',
    paymentMethod: 'Cash on Delivery (COD)'
  });

  const [placing, setPlacing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // 1. Strict Authentication Gating for Checkout
  if (!user && !completedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase">Authentication Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          In real e-commerce apps, checkout, orders, and warranty registrations are strictly isolated to verified customer accounts. Please sign in to proceed with your order.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => openAuthModal(undefined, 'Sign in to complete checkout and place your order.')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Complete Purchase</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/cart"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors text-center"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPlacing(true);

    // Generate Order Record
    const orderId = `NC-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `LP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customer_id: user.id,
      customer_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      shipping_address: `${formData.address}, ${formData.city}`,
      courier: formData.courier.split(' ')[0],
      tracking_number: trackingNumber,
      status: 'Processing',
      total_amount: totalAmount,
      total_amount_usd: totalAmountUsd,
      created_at: new Date().toISOString(),
      items: items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        price_usd: i.product.priceUsd || Math.round(i.product.price / 280),
        image: i.product.image
      }))
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    try {
      const response = await fetch(`${API_URL}/store/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      if (response.ok) {
        const savedDbOrder = await response.json();
        // Save database-confirmed order to local storage
        const existingSwoo = JSON.parse(localStorage.getItem('swoo_orders') || '[]');
        localStorage.setItem('swoo_orders', JSON.stringify([savedDbOrder, ...existingSwoo]));
        const existingNova = JSON.parse(localStorage.getItem('novacart_orders') || '[]');
        localStorage.setItem('novacart_orders', JSON.stringify([savedDbOrder, ...existingNova]));

        setCompletedOrder(savedDbOrder);
        clearCart();
        setPlacing(false);
        return;
      }
    } catch (err) {
      console.warn('Backend sync failed, storing locally:', err);
    }

    // Client fallback if backend unreachable
    const existingSwoo = JSON.parse(localStorage.getItem('swoo_orders') || '[]');
    localStorage.setItem('swoo_orders', JSON.stringify([newOrder, ...existingSwoo]));
    const existingNova = JSON.parse(localStorage.getItem('novacart_orders') || '[]');
    localStorage.setItem('novacart_orders', JSON.stringify([newOrder, ...existingNova]));

    setTimeout(() => {
      setPlacing(false);
      setCompletedOrder(newOrder);
      clearCart();
    }, 800);
  };

  if (completedOrder) {
    const formattedCompletedTotal = formatPrice(completedOrder.total_amount, completedOrder.total_amount_usd);

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm animate-in zoom-in-50 duration-300">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Order Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 uppercase">
          Thank you for your purchase!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Your order has been received and is being prepared for dispatch.
        </p>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-xs space-y-3">
          <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Order Reference</span>
              <strong className="text-lg text-emerald-700 font-black">{completedOrder.id}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
              <strong className="text-lg text-slate-900 font-black">{formattedCompletedTotal}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Courier</span>
              <span className="font-bold text-slate-800">{completedOrder.courier}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracking Number</span>
              <span className="font-bold text-emerald-700 font-mono">{completedOrder.tracking_number}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Shipping Address</span>
            <span className="font-medium text-slate-800">{completedOrder.shipping_address}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/orders"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const grandTotal = formatPrice(totalAmount, totalAmountUsd);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8 uppercase">
        Secure Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: FORM FIELDS */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. SHIPPING INFO */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              1. Delivery & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 2. COURIER */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              2. Shipping Service
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Leopard Express (1-2 Business Days)', note: 'Fast nationwide courier' },
                { name: 'TCS Express (Same Day / Next Day)', note: 'Priority air courier' }
              ].map((c) => (
                <label
                  key={c.name}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    formData.courier === c.name
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="courier"
                      checked={formData.courier === c.name}
                      onChange={() => setFormData({ ...formData, courier: c.name })}
                      className="accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-800">{c.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 pl-5">{c.note}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. PAYMENT */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              3. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Cash on Delivery (COD)', note: 'Pay in cash upon doorstep delivery' },
                { name: 'Direct Bank Transfer / PayPak', note: 'IBAN details sent via SMS' }
              ].map((m) => (
                <label
                  key={m.name}
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    formData.paymentMethod === m.name
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === m.name}
                      onChange={() => setFormData({ ...formData, paymentMethod: m.name })}
                      className="accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-800">{m.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 pl-5">{m.note}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-black text-slate-900 uppercase">Order Breakdown</h2>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 text-xs">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{product.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: {quantity}</p>
                </div>
                <span className="font-bold text-slate-800">
                  {formatPrice(product.price * quantity, (product.priceUsd || Math.round(product.price / 280)) * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">{grandTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-emerald-700 font-bold">FREE</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-slate-100 pt-3">
              <span className="text-sm font-black text-slate-900 uppercase">Total to Pay</span>
              <span className="text-xl font-black text-emerald-700">{grandTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {placing ? (
              <span>Placing Your Order...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
