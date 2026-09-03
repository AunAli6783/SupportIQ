'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Zap,
  Star
} from 'lucide-react';

const SLIDES = [
  {
    tag: 'Flagship 2024–2026 AI Laptops',
    pill: 'Intel Core Ultra & Apple M3 Max Silicon',
    title: 'THE NEXT ERA OF COMPUTING.',
    subtitle: 'High-performance AI neural engines, tandem OLED displays, and all-day battery efficiency built for creators and engineers.',
    discount: 'UP TO 15% OFF',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    link: '/products?category=Laptops',
    badge: '2026 In Stock',
    specs: ['Up to 128GB RAM', 'RTX 4090 / M3 Max', '3.2K Tandem OLED']
  },
  {
    tag: 'Next-Gen Mobile Intelligence',
    pill: 'Galaxy AI & Apple Intelligence Ready',
    title: 'TITANIUM SMARTPHONES.',
    subtitle: 'Experience 200MP zoom optics, satellite connectivity, and on-device generative intelligence on Samsung S25 Ultra & iPhone 16 Pro Max.',
    discount: 'SAVE UP TO 65,000 PKR',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    link: '/products?category=Smartphones',
    badge: 'Exclusive Launch Price',
    specs: ['Titanium Grade 5', '2600 Nits AMOLED', 'Snapdragon 8 Gen 4']
  }
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B233A] via-[#212844] to-[#0F1424] text-white shadow-2xl min-h-[340px] md:min-h-[420px] flex items-center border border-slate-700/50">
        
        {/* Subtle background tech grid and radial glowing orbs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#008ECC]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content Grid */}
        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-10 md:p-14">
          
          {/* Left Hero Content */}
          <div className="md:col-span-7 flex flex-col items-start gap-4">
            
            {/* Top Pill Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-sky-300 border border-white/15 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                {slide.tag}
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-300 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                {slide.pill}
              </span>
            </div>

            {/* Headline & Subtitle */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-[1.1] font-sans drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-2 font-normal leading-relaxed max-w-xl">
                {slide.subtitle}
              </p>
            </div>

            {/* Feature spec pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {slide.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                  <Cpu className="w-3.5 h-3.5 text-[#008ECC]" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            {/* Discount & Savings Callout */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-[#008ECC] tracking-tight">
                {slide.discount}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {slide.badge}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Link
                href={slide.link}
                className="bg-gradient-to-r from-[#008ECC] to-sky-600 hover:from-[#007BB0] hover:to-sky-700 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all flex items-center gap-2 group"
              >
                <span>Shop This Drop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-3.5 rounded-2xl font-semibold text-sm backdrop-blur-md transition-all border border-white/15"
              >
                Browse All Deals
              </Link>
            </div>
          </div>

          {/* Right Floating Product Hero Graphics */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Pulsing Backlight Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#008ECC]/30 to-sky-400/20 rounded-full blur-3xl transform scale-90 animate-pulse" />
              
              <img
                src={slide.image}
                alt={slide.title}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] rounded-3xl transform hover:scale-105 transition-transform duration-700"
              />

              {/* Verified Product Floating Pill */}
              <div className="absolute -bottom-2 -left-2 z-20 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-xl">
                <ShieldCheck className="w-4 h-4 text-[#008ECC]" />
                <span className="text-[11px] font-bold text-slate-100">Official Brand Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Slide Arrow Navigators */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md z-20 border border-white/10 hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md z-20 border border-white/10 hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Modern Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? 'w-8 bg-gradient-to-r from-[#008ECC] to-sky-400 shadow-sm' : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
