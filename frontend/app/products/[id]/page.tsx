'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS } from '../../../data/products';
import { useCart } from '../../../context/CartContext';
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
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = PRODUCTS.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested product does not exist in our catalog.</p>
        <Link href="/products" className="mt-4 inline-block bg-[#008ECC] text-white px-5 py-2.5 rounded-xl font-bold text-xs">
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

  const savings = product.originalPrice - product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-[#008ECC]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-[#008ECC]">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#008ECC]">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">{product.name}</span>
      </nav>

      {/* MAIN PRODUCT DETAIL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-sm">
        {/* LEFT: PRODUCT IMAGE */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#F8FAFC] rounded-2xl p-6 relative">
          {product.discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-[#008ECC] text-white text-xs font-black px-3 py-1 rounded-xl shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-[420px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* RIGHT: SPECS & BUY BOX */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Brand & Stock Pill */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008ECC] bg-[#008ECC]/10 px-2.5 py-1 rounded-lg">
                {product.brand} Official
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
            </div>

            {/* Tagline */}
            <p className="text-xs md:text-sm text-slate-600 mt-3 font-medium leading-relaxed">
              {product.tagline}
            </p>

            {/* Pricing Section */}
            <div className="mt-5 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {product.price.toLocaleString()} PKR
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    {product.originalPrice.toLocaleString()} PKR
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs font-bold text-emerald-600">
                  You Save: {savings.toLocaleString()} PKR ({product.discountPercent}% Discount)
                </span>
              )}
            </div>

            {/* Hardware Specifications Table */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Hardware Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.specs.processor && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Processor</span>
                    <span className="font-semibold text-slate-800">{product.specs.processor}</span>
                  </div>
                )}
                {product.specs.ram && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Memory (RAM)</span>
                    <span className="font-semibold text-slate-800">{product.specs.ram}</span>
                  </div>
                )}
                {product.specs.storage && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage</span>
                    <span className="font-semibold text-slate-800">{product.specs.storage}</span>
                  </div>
                )}
                {product.specs.display && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Display</span>
                    <span className="font-semibold text-slate-800">{product.specs.display}</span>
                  </div>
                )}
                {product.specs.battery && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Battery Life</span>
                    <span className="font-semibold text-slate-800">{product.specs.battery}</span>
                  </div>
                )}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Warranty</span>
                  <span className="font-semibold text-emerald-700">{product.specs.warranty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUANTITY & PURCHASE ACTIONS */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-600">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-black text-slate-900 bg-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#008ECC] hover:bg-[#007BB0] text-white shadow-sky-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Shopping Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
