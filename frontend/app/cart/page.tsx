'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalAmount, totalSavings, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-sky-50 text-[#008ECC] rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Shopping Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Explore our catalog of 2024–2026 AI laptops, flagship smartphones, and professional creator gear.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 bg-[#008ECC] hover:bg-[#007BB0] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-sky-500/20 transition-all"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-[#008ECC]" />
          Shopping Cart ({items.length} items)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: CART ITEMS LIST */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            >
              {/* Thumbnail */}
              <Link href={`/products/${product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F8FAFC] p-2 flex items-center justify-center shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-[#008ECC] uppercase tracking-wider">{product.brand}</span>
                <Link href={`/products/${product.id}`} className="block text-sm font-bold text-slate-800 hover:text-[#008ECC] transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{product.tagline}</p>

                <div className="flex items-baseline gap-2 mt-2 justify-center sm:justify-start">
                  <span className="text-base font-black text-slate-900">
                    {(product.price * quantity).toLocaleString()} PKR
                  </span>
                  <span className="text-xs text-slate-400">
                    ({product.price.toLocaleString()} PKR each)
                  </span>
                </div>
              </div>

              {/* Stepper & Delete */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900 bg-white">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  title="Remove item"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-800">{totalAmount.toLocaleString()} PKR</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Savings:</span>
                <span>-{totalSavings.toLocaleString()} PKR</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping:</span>
              <span className="text-emerald-600 font-bold">FREE Express Delivery</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST / Taxes:</span>
              <span>Included</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Payable:</span>
            <span className="text-2xl font-black text-[#008ECC] tracking-tight">
              {totalAmount.toLocaleString()} PKR
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3.5 bg-[#008ECC] hover:bg-[#007BB0] text-white rounded-xl font-bold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="pt-2 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Secure 256-Bit SSL Encrypted Checkout
            </p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Truck className="w-3.5 h-3.5 text-[#008ECC]" />
              Trackable via Leopard / TCS Express
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
