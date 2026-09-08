'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalAmount, totalAmountUsd, totalSavings, totalSavingsUsd, clearCart } = useCart();
  const { formatPrice, currency, requireAuth } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Your Shopping Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Explore our SWOO TECH MART catalog of 2026 tech products, Apple laptops, and noise-cancelling audio gear.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const formattedTotal = formatPrice(totalAmount, totalAmountUsd);
  const formattedSavings = formatPrice(totalSavings, totalSavingsUsd);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
          <ShoppingCart className="w-7 h-7 text-emerald-600" />
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
          {items.map(({ product, quantity }) => {
            const itemPrice = formatPrice(product.price, product.priceUsd);
            const itemSubtotal = formatPrice(
              product.price * quantity, 
              (product.priceUsd || Math.round(product.price / 280)) * quantity
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Thumbnail */}
                <Link href={`/products/${product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors truncate mt-0.5">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Unit Price: {itemPrice}
                  </p>

                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-800">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block sm:hidden">Total:</span>
                  <span className="text-base font-black text-slate-900">
                    {itemSubtotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-black text-slate-900 uppercase">Order Summary</h2>

          <div className="space-y-2.5 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-bold text-slate-800">{formattedTotal}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Savings</span>
                <span className="font-bold">-{formattedSavings}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Express Delivery</span>
              <span className="text-emerald-700 font-bold">FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-black text-slate-900 uppercase">Grand Total</span>
            <span className="text-xl font-black text-emerald-700">{formattedTotal}</span>
          </div>

          <button
            onClick={() => {
              requireAuth(() => {
                router.push('/checkout');
              }, 'Sign in with your verified customer account to proceed to checkout.');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine 2026 Tech Products Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free Express Courier Delivery Nationwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
