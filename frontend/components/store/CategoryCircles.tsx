'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOP_CATEGORIES = [
  {
    name: 'Laptops',
    slug: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'PC Gaming',
    slug: 'Laptops',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Headphones',
    slug: 'Audio & Wearables',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Monitors',
    slug: 'Tablets & Displays',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
  }
];

export default function CategoryCircles() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header: TOP CATEGORIES + View All + < > Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
          TOP CATEGORIES
        </h3>
        <div className="flex items-center gap-3">
          <Link 
            href="/products" 
            className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
          >
            View All
          </Link>
          <div className="flex items-center gap-1">
            <button className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Category Cutouts */}
      <div className="grid grid-cols-4 gap-3 py-3 items-end text-center">
        {TOP_CATEGORIES.map((cat, idx) => (
          <Link
            key={idx}
            href={`/products?category=${encodeURIComponent(cat.slug)}`}
            className="flex flex-col items-center group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <img
                src={cat.image}
                alt={cat.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mt-2">
              {cat.name}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
