'use client';

import React from 'react';
import Link from 'next/link';
import { PRODUCTS } from '../data/products';
import HeroBanner from '../components/store/HeroBanner';
import CategoryCircles from '../components/store/CategoryCircles';
import ProductCard from '../components/store/ProductCard';
import BrandBanners from '../components/store/BrandBanners';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Cpu,
  BadgeCheck
} from 'lucide-react';

export default function HomePage() {
  const smartphones = PRODUCTS.filter((p) => p.category === 'Smartphones');
  const laptops = PRODUCTS.filter((p) => p.category === 'Laptops');
  const audioAndTablets = PRODUCTS.filter((p) => p.category === 'Audio & Wearables' || p.category === 'Tablets & Displays');

  return (
    <div className="flex flex-col gap-4 pb-16">
      {/* 1. NEXT-GEN HERO BANNER */}
      <HeroBanner />

      {/* 2. SECTION: SMARTPHONES BEST DEALS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008ECC] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Limited Stock Offers
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
              Grab the best deal on <span className="text-[#008ECC] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#008ECC]">Smartphones</span>
            </h2>
          </div>
          <Link
            href="/products?category=Smartphones"
            className="text-xs font-bold text-[#008ECC] hover:text-[#007BB0] flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {smartphones.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. SECTION: TOP CATEGORIES CAPSULES */}
      <CategoryCircles />

      {/* 4. SECTION: AI LAPTOPS & WORKSTATIONS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008ECC] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Next-Gen Neural Engines
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
              Flagship <span className="text-[#008ECC] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#008ECC]">AI Laptops & Workstations</span>
            </h2>
          </div>
          <Link
            href="/products?category=Laptops"
            className="text-xs font-bold text-[#008ECC] hover:text-[#007BB0] flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {laptops.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL FEATURE CALLOUT BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#212844] via-[#1B233A] to-[#008ECC] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center justify-center md:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              SupportIQ AI Advantage
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Instant AI Hardware Recommendation & Order Tracking
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Confused between MacBook M3 Max and Dell XPS 16? Click the floating robot assistant below to compare real-time specs, warranties, and stock.
            </p>
          </div>
          <Link
            href="/products"
            className="bg-white text-slate-900 hover:bg-sky-50 px-6 py-3 rounded-2xl font-bold text-xs shadow-lg hover:scale-105 transition-all shrink-0 flex items-center gap-2"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#008ECC]" />
          </Link>
        </div>
      </section>

      {/* 6. SECTION: TOP ELECTRONICS BRANDS MINI BANNERS */}
      <BrandBanners />

      {/* 7. SECTION: AUDIO & TABLETS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008ECC] flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Creator Class Audio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
              Premium <span className="text-[#008ECC] relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#008ECC]">Creator & Audio Hardware</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {audioAndTablets.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
