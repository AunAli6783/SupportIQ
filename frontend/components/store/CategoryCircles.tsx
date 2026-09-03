'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const TOP_CATEGORIES = [
  {
    name: 'Smartphones',
    slug: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
    count: '4 Flagships',
    accent: 'from-blue-500/10 to-sky-500/5'
  },
  {
    name: 'Laptops',
    slug: 'Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
    count: '6 Systems',
    accent: 'from-indigo-500/10 to-sky-500/5'
  },
  {
    name: 'Audio',
    slug: 'Audio & Wearables',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    count: 'Sony / Apple',
    accent: 'from-sky-500/10 to-teal-500/5'
  },
  {
    name: 'Tablets',
    slug: 'Tablets & Displays',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
    count: 'iPad Pro M4',
    accent: 'from-purple-500/10 to-indigo-500/5'
  },
  {
    name: 'Accessories',
    slug: 'Accessories',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80',
    count: 'Fast Chargers',
    accent: 'from-cyan-500/10 to-blue-500/5'
  }
];

export default function CategoryCircles() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#008ECC] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Ecosystems
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
            Shop From <span className="text-[#008ECC] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#008ECC]">Top Categories</span>
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#008ECC] hover:text-[#007BB0] flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* CIRCULAR CATEGORY CAPSULES WITH GLOW STYLES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
        {TOP_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/products?category=${encodeURIComponent(cat.slug)}`}
            className="flex flex-col items-center bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-[#008ECC] shadow-2xs hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group cursor-pointer text-center"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-2 border border-slate-200/80 group-hover:border-[#008ECC] group-hover:scale-105 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-115 transition-transform duration-500 drop-shadow-sm"
              />
            </div>
            <span className="text-sm font-extrabold text-slate-900 mt-3 text-center group-hover:text-[#008ECC] transition-colors">
              {cat.name}
            </span>
            <span className="text-[11px] text-slate-400 font-medium mt-0.5">{cat.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
