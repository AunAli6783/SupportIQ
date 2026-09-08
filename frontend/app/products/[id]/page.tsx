'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS } from '../../../data/products';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  ArrowLeft,
  ChevronRight,
  Zap,
  Bot
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice, currency } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-slate-800 uppercase">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested product does not exist in the SWOO TECH MART catalog.</p>
        <Link href="/products" className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const formattedPrice = formatPrice(product.price, product.priceUsd);
  const formattedOriginalPrice = formatPrice(product.originalPrice, product.originalPriceUsd);
  const formattedSavings = formatPrice(
    product.originalPrice - product.price, 
    (product.originalPriceUsd || 0) - (product.priceUsd || 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: IMAGE STAGE */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center relative shadow-xs">
          {product.badge && (
            <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-[400px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* RIGHT COLUMN: PRODUCT DETAILS & PURCHASE */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">{product.brand}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400 font-medium">SKU: {product.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
              {product.name}
            </h1>

            {/* RATINGS */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} verified customer reviews)</span>
            </div>

            {/* PRICE & SAVINGS */}
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                {formattedPrice}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    {formattedOriginalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Save {formattedSavings} ({product.discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* SPECS HIGHLIGHTS */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Hardware Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.specs.processor && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Processor / Silicon</span>
                    <span className="font-bold text-slate-800">{product.specs.processor}</span>
                  </div>
                )}
                {product.specs.ram && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">RAM Memory</span>
                    <span className="font-bold text-slate-800">{product.specs.ram}</span>
                  </div>
                )}
                {product.specs.storage && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Capacity</span>
                    <span className="font-bold text-slate-800">{product.specs.storage}</span>
                  </div>
                )}
                {product.specs.display && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Display Panel</span>
                    <span className="font-bold text-slate-800">{product.specs.display}</span>
                  </div>
                )}
                {product.specs.battery && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Battery & Power</span>
                    <span className="font-bold text-slate-800">{product.specs.battery}</span>
                  </div>
                )}
                {product.specs.warranty && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Warranty</span>
                    <span className="font-bold text-emerald-700">{product.specs.warranty}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm"
                >
                  +
                </button>
              </div>

              <span className="text-xs font-medium text-emerald-700">
                In Stock ({product.stock} units available)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                className={`w-full sm:flex-1 py-3 px-6 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  added 
                    ? 'bg-emerald-800 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-950 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Instant Checkout</span>
              </button>
            </div>

            {/* ASK AI WIDGET SHORTCUT */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">
                  Have questions about {product.name}?
                </span>
              </div>
              <Link
                href={`/support?q=${encodeURIComponent(`Tell me more about ${product.name} specs, compatibility, and return policy.`)}`}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Ask Swoo AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
