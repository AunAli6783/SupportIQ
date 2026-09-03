'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

const BRANDS = [
  {
    name: 'Apple',
    slug: 'Apple',
    tag: 'Official Apple Authorised',
    discount: 'UP TO 12% OFF',
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-slate-700/60',
    tagColor: 'text-sky-300',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
    subtitle: 'M4 Silicon & iPhone 16 Pro'
  },
  {
    name: 'Samsung',
    slug: 'Samsung',
    tag: 'Galaxy AI Flagships',
    discount: 'UP TO 15% OFF',
    bg: 'bg-gradient-to-br from-sky-50 via-sky-100/60 to-white text-slate-900 border-sky-200/80',
    tagColor: 'text-[#008ECC]',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80',
    subtitle: 'Galaxy S25 Ultra 5G'
  },
  {
    name: 'Dell',
    slug: 'Dell',
    tag: 'Dell Premier Partner',
    discount: 'UP TO 14% OFF',
    bg: 'bg-gradient-to-br from-slate-50 via-slate-100 to-white text-slate-900 border-slate-200',
    tagColor: 'text-indigo-600',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80',
    subtitle: 'XPS 16 OLED Core Ultra'
  },
  {
    name: 'Lenovo',
    slug: 'Lenovo',
    tag: 'Lenovo Legion AI',
    discount: 'UP TO 15% OFF',
    bg: 'bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white text-slate-900 border-amber-200/80',
    tagColor: 'text-amber-700',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop&q=80',
    subtitle: 'Legion Pro 7i Gen 9'
  }
];

export default function BrandBanners() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#008ECC] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Official Brand Partners
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
            Top <span className="text-[#008ECC] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#008ECC]">Electronics Brands</span>
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-[#008ECC] hover:text-[#007BB0] flex items-center gap-1 transition-colors group"
        >
          <span>View All Brands</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* BRAND MINI BANNERS WITH HIGH-END FINISH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/products?brand=${brand.slug}`}
            className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border ${brand.bg} shadow-sm hover:shadow-xl hover:shadow-slate-300/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group`}
          >
            <div className="flex flex-col z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">{brand.tag}</span>
              <h3 className="text-lg font-black tracking-tight mt-0.5">{brand.name}</h3>
              <span className={`text-xs font-black mt-1 ${brand.tagColor}`}>
                {brand.discount}
              </span>
              <span className="text-[11px] opacity-80 mt-1 font-medium">{brand.subtitle}</span>
            </div>
            
            <div className="w-24 h-24 relative shrink-0">
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-full object-contain group-hover:scale-115 transition-transform duration-500 drop-shadow-md"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
