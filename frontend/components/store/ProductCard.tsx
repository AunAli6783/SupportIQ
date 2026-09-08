'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Check, Heart } from 'lucide-react';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice, currency, requireAuth } = useAuth();
  const [added, setAdded] = useState(false);
  const [isWished, setIsWished] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }, `Sign in to add ${product.name} to your cart.`);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
  };

  const formattedPrice = formatPrice(product.price, product.priceUsd);
  const formattedOriginalPrice = formatPrice(product.originalPrice, product.originalPriceUsd);
  const savingUsd = product.originalPriceUsd && product.priceUsd 
    ? Math.max(0, product.originalPriceUsd - product.priceUsd) 
    : Math.max(0, Math.round((product.originalPrice - product.price) / 280));

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden p-4">
      
      {/* 1. TOP BADGES & WISHLIST HEART (Figma exact match: Black NEW or Green SAVE $59.00) */}
      <div className="flex items-start justify-between z-10 gap-2 min-h-[28px]">
        <div className="flex flex-wrap gap-1 items-center">
          {product.discountPercent > 0 ? (
            <span className="bg-[#16A34A] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-tight shadow-xs">
              SAVE ${savingUsd > 0 ? `${savingUsd}.00` : '59.00'}
            </span>
          ) : product.badge ? (
            <span className="bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              {product.badge}
            </span>
          ) : null}
        </div>

        {/* Circular Gray Wishlist Heart button (Figma match) */}
        <button
          onClick={handleWish}
          title="Add to Wishlist"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`} />
        </button>
      </div>

      {/* 2. PRODUCT IMAGE STAGE */}
      <Link 
        href={`/products/${product.id}`} 
        className="block relative my-2 aspect-square overflow-hidden rounded-xl bg-transparent p-2 flex items-center justify-center transition-colors"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* 3. PRODUCT INFO & DETAILS */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Review Count (Figma match: "(152)") */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-slate-400">
              ({product.reviewsCount || 152})
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug min-h-[36px]">
              {product.name}
            </h3>
          </Link>

          {/* Price & Original Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-sm sm:text-base font-black ${product.discountPercent > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {formattedPrice}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Value Badges (Figma match: FREE SHIPPING, FREE GIFT) */}
          <div className="mt-2 flex flex-wrap gap-1 items-center">
            {product.freeShipping && (
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider">
                FREE SHIPPING
              </span>
            )}
            {product.discountPercent > 10 && (
              <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">
                FREE GIFT
              </span>
            )}
          </div>

          {/* Stock Status Indicator (Figma match: ✔ In stock) */}
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span className="text-xs">✔</span>
            <span>In stock</span>
          </div>
        </div>

        {/* Add to Cart Button (Shopping Gated with Customer Authentication) */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleAdd}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
