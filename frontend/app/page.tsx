'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, Product } from '../data/products';
import HeroBanner from '../components/store/HeroBanner';
import CategoryCircles from '../components/store/CategoryCircles';
import ProductCard from '../components/store/ProductCard';
import BrandBanners from '../components/store/BrandBanners';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ChevronRight,
  ChevronLeft,
  Laptop,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SUBCATEGORIES_GRID = [
  { name: 'Macbook', items: '74 Items', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80', query: 'q=Macbook' },
  { name: 'Gaming PC', items: '5 Items', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&auto=format&fit=crop&q=80', query: 'category=Laptops' },
  { name: 'Laptop Office', items: '22 Items', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80', query: 'category=Laptops' },
  { name: 'Laptop 15"', items: '55 Items', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200&auto=format&fit=crop&q=80', query: 'category=Laptops' },
  { name: 'M1 2023', items: '32 Items', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&auto=format&fit=crop&q=80', query: 'q=Apple' },
  { name: 'Secondhand', items: '16 Items', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80', query: 'category=Laptops' },
];

export default function HomePage() {
  const { currency, formatPrice } = useAuth();
  const [carouselPage, setCarouselPage] = useState(1);

  const laptops = PRODUCTS.filter((p) => p.category === 'Laptops');
  const smartphones = PRODUCTS.filter((p) => p.category === 'Smartphones');
  const accessoriesAndAudio = PRODUCTS.filter((p) => p.category === 'Audio & Wearables' || p.category === 'Accessories');

  return (
    <div className="flex flex-col gap-4 pb-16 bg-[#F8FAFC]">
      
      {/* 1. BENTO HERO BANNER (Left Menu + Center Headphone + Right Watch/Cam + Bottom Speaker/Keyboard) */}
      <HeroBanner />

      {/* 2. FEATURED BRANDS & TOP CATEGORIES (Figma exact match: two side-by-side cards in one row) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <BrandBanners />
          <CategoryCircles />
        </div>
      </section>

      {/* 3. BEST LAPTOPS & COMPUTERS (Figma uploaded_media_4 exact match) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          
          {/* Section Header: BEST LAPTOPS & COMPUTERS + View All */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
              BEST LAPTOPS & COMPUTERS
            </h2>
            <Link 
              href="/products?category=Laptops" 
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Top Row: Left Mobok 2 Banner + Right 3x2 Subcategories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 items-center">
            
            {/* Left Banner: Mobok 2 Superchard By M2 / M5 Max */}
            <div className="lg:col-span-5 bg-[#1E293B] text-white rounded-2xl p-6 sm:p-7 flex items-center justify-between relative overflow-hidden shadow-xs">
              <div className="z-10 max-w-[200px]">
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  Mobok 2<br />Superchard
                </h3>
                <p className="text-sm font-light text-slate-300 mt-1">
                  By M5 Max
                </p>
                <p className="text-xs font-bold text-[#16A34A] mt-4">
                  Start from $1,199
                </p>
              </div>

              <div className="w-48 sm:w-56 h-36 shrink-0 flex items-center justify-center -mr-4">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80"
                  alt="Mobok 2 Superchard Laptop"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right: 3x2 Grid of Subcategories with Thumbnails */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SUBCATEGORIES_GRID.map((sub, i) => (
                <Link
                  key={i}
                  href={`/products?${sub.query}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50 transition-all group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                      {sub.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {sub.items}
                    </span>
                  </div>
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center p-1">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100 my-2" />

          {/* Product Cards Carousel Row matching uploaded_media_4 */}
          <div className="relative py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
              {laptops.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Bottom Center Pagination Pill: < 1 / 16 > */}
          <div className="flex items-center justify-center pt-4">
            <div className="bg-[#1E293B] text-white rounded-full px-4 py-1.5 flex items-center gap-4 text-xs font-bold shadow-md">
              <button 
                onClick={() => setCarouselPage((p) => Math.max(1, p - 1))}
                className="hover:text-emerald-400 transition-colors"
              >
                &lt;
              </button>
              <span className="font-mono text-xs font-black">{carouselPage} / 16</span>
              <button 
                onClick={() => setCarouselPage((p) => Math.min(16, p + 1))}
                className="hover:text-emerald-400 transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 2026 FLAGSHIP SMARTPHONES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                GALAXY AI & APPLE INTELLIGENCE 2026
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                Latest 2026 Flagship Smartphones
              </h2>
            </div>
            <Link
              href="/products?category=Smartphones"
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {smartphones.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. AUDIO, WEARABLES & TECH ACCESSORIES */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-2">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                HI-RES AUDIO & FAST CHARGING
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase">
                Audio, Smartwatches & Accessories
              </h2>
            </div>
            <Link
              href="/products?category=Accessories"
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accessoriesAndAudio.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
