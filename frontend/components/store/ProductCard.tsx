'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Check, ShieldCheck, Zap, ArrowUpRight, Cpu } from 'lucide-react';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const savings = product.originalPrice - product.price;

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-[#008ECC] shadow-xs hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden p-4 sm:p-5">
      
      {/* 1. TOP BADGES (Discount Pill + Warranty Badge) */}
      <div className="flex items-center justify-between z-10 gap-2">
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Official Warranty
        </span>
        {product.discountPercent > 0 && (
          <span className="text-[11px] font-black bg-gradient-to-r from-[#008ECC] to-sky-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
            {product.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* 2. PRODUCT IMAGE STAGE */}
      <Link 
        href={`/products/${product.id}`} 
        className="block relative my-4 aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 flex items-center justify-center group-hover:bg-sky-50/40 transition-colors"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-md"
        />
        
        {/* Quick view hover icon button */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-[#008ECC]" />
        </div>
      </Link>

      {/* 3. PRODUCT INFO & DETAILS */}
      <div className="flex flex-col flex-1">
        {/* Brand & Star Rating */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-extrabold text-[#008ECC] uppercase text-[10px] tracking-wider bg-sky-50 px-2 py-0.5 rounded-md">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50/80 px-2 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 hover:text-[#008ECC] transition-colors leading-snug tracking-tight"
        >
          {product.name}
        </Link>

        {/* Tagline snippet */}
        <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
          {product.tagline}
        </p>

        {/* Pricing Block */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {product.price.toLocaleString()} PKR
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>Save {savings.toLocaleString()} PKR</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. ACTIONS: Add to Cart + Details */}
      <div className="mt-4 pt-2 flex items-center gap-2">
        <button
          onClick={handleAdd}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-[#008ECC] to-sky-600 hover:from-[#007BB0] hover:to-sky-700 text-white shadow-sky-500/25'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Bag!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
        <Link
          href={`/products/${product.id}`}
          className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#008ECC] text-slate-700 hover:text-[#008ECC] text-xs font-bold transition-all hover:bg-sky-50/50 shrink-0"
        >
          Specs
        </Link>
      </div>
    </div>
  );
}
