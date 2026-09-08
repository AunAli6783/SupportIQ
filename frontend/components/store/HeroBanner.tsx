'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Tv, 
  Gamepad2, 
  Camera, 
  Watch, 
  Home, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroBanner() {
  const { currency, formatPrice } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      tag: 'NOISE CANCELLING 2026',
      priceTag: 'ONLY $299',
      pricePkr: 89000,
      priceUsd: 299,
      title: 'Boso Over-Ear Wireless Headphone',
      subtitle: 'Wireless Noise Cancelling with 3D Spatial Audio and 24h battery life.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      link: '/products/P-1014'
    },
    {
      tag: 'NEW FLAGSHIP 2026',
      priceTag: 'FROM $1,399',
      pricePkr: 430000,
      priceUsd: 1399,
      title: 'Samsung Galaxy S26 Ultra 5G',
      subtitle: 'Snapdragon 8 Elite Gen 2 (2nm), 200MP camera, built-in S-Pen & One UI 8.',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      link: '/products/P-1002'
    },
    {
      tag: '2NM SILICON LEAP',
      priceTag: 'FROM $1,599',
      pricePkr: 495000,
      priceUsd: 1599,
      title: 'Apple iPhone 18 Pro Max',
      subtitle: 'TSMC 2nm A20 Pro chip, C2 modem, under-display Face ID & 12GB RAM.',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      link: '/products/P-1005'
    },
    {
      tag: 'M5 MAX POWER 2026',
      priceTag: 'FROM $1,999',
      pricePkr: 560000,
      priceUsd: 1999,
      title: 'Apple MacBook Pro 16" M5 Max',
      subtitle: 'Neural Accelerator 4x AI leap, Liquid Retina XDR, and 24h battery life.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      link: '/products/P-1001'
    }
  ];

  const currentSlide = heroSlides[activeSlide];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const categories = [
    { name: 'SALE 40% OFF', isSale: true, query: 'sale=true' },
    { name: 'Laptops', query: 'category=Laptops' },
    { name: 'PC & Computers', query: 'category=Laptops' },
    { name: 'Cell Phones', query: 'category=Smartphones' },
    { name: 'Tablets', query: 'category=Tablets+%26+Displays' },
    { name: 'Gaming & VR', query: 'category=Laptops' },
    { name: 'Networking', query: 'category=Accessories' },
    { name: 'Cameras', query: 'category=Accessories' },
    { name: 'Sounds', query: 'category=Audio+%26+Wearables' },
    { name: 'Office', query: 'category=Accessories' },
    { name: 'Storage, USB', query: 'category=Accessories' },
    { name: 'Accessories', query: 'category=Accessories' },
    { name: 'Clearance', query: 'category=Accessories' },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
      
      {/* 1. TOP BENTO ROW: CATEGORIES MENU (LEFT) + HERO CAROUSEL (CENTER) + TWO PROMO CARDS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT COLUMN: VERTICAL CATEGORY MENU (Figma exact match) */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
          <div className="space-y-1">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/products?${cat.query}`}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                  cat.isSale 
                    ? 'text-red-600 font-black tracking-wider uppercase hover:bg-red-50' 
                    : 'text-slate-700 font-semibold hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                {!cat.isSale && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* CENTER HERO CARD: MAIN NOISE CANCELLING HEADPHONES (Figma match) */}
        <div className="lg:col-span-6 bg-gradient-to-r from-slate-400/30 via-slate-300/40 to-slate-200/50 rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xs min-h-[400px]">
          
          {/* Top header on card */}
          <div className="z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              <span className="font-black block text-slate-900 drop-shadow-xs">Noise Cancelling</span>
              <span className="font-light text-slate-700">Headphone</span>
            </h1>

            <div className="text-xs text-slate-600 mt-4 leading-relaxed font-medium space-y-0.5">
              <p>Boso Over-Ear Headphone</p>
              <p>Wifi, Voice Assistant,</p>
              <p>Low Latency Game Mde</p>
            </div>

            <div className="mt-6">
              <Link
                href="/products/P-1014"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-900 hover:text-white text-slate-900 font-black text-xs px-6 py-2.5 rounded-full transition-all duration-200 shadow-md"
              >
                <span>BUY NOW</span>
              </Link>
            </div>
          </div>

          {/* Large Product Image Positioned on the right */}
          <div className="absolute right-0 bottom-4 w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] pointer-events-none flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
              alt="Boso Over-Ear Headphone"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* Carousel Pagination Pill in Bottom Right: < 3 / 3 > */}
          <div className="self-end z-10 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1 flex items-center gap-2 shadow-xs text-xs font-bold text-slate-600">
            <button onClick={prevSlide} className="hover:text-emerald-600 font-bold">&lt;</button>
            <span className="text-[11px] font-mono font-bold">3 / 3</span>
            <button onClick={nextSlide} className="hover:text-emerald-600 font-bold">&gt;</button>
          </div>
        </div>

        {/* RIGHT COLUMN: TWO STACKED CARDS (Figma match: XOMIA SMARTWATCH + OKODO HERO 11+ CAM) */}
        <div className="lg:col-span-3 flex flex-col gap-4 justify-between">
          
          {/* Top Card: XOMIA Sport Water Resistance Watch (White Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-300 transition-all flex-1">
            <div className="flex flex-col justify-between h-full z-10">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                  XOMIA
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-snug mt-0.5 max-w-[130px]">
                  Sport Water Resistance Watch
                </h3>
              </div>
              <Link
                href="/products/P-1019"
                className="inline-block bg-[#1E293B] hover:bg-black text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-xs transition-colors mt-4 text-center w-fit"
              >
                SHOP NOW
              </Link>
            </div>

            <div className="w-24 h-24 shrink-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80"
                alt="Xomia Watch"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Bottom Card: OKODO HERO 11+ BLACK (Dark Card from $169) */}
          <div className="bg-[#1E293B] text-white rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden group hover:bg-slate-900 transition-all flex-1">
            <div className="flex flex-col justify-between h-full z-10">
              <div>
                <h3 className="text-sm font-black text-white leading-snug max-w-[130px]">
                  OKODO HERO 11+ BLACK
                </h3>
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                    FROM
                  </span>
                  <span className="text-lg font-black text-[#16A34A] leading-tight">
                    $169
                  </span>
                </div>
              </div>
            </div>

            <div className="w-24 h-24 shrink-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80"
                alt="Okodo Hero Camera"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM PROMO BANNERS ROW (Figma match: SONO PLAYGO 5 + LOGITEK KEYBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        
        {/* Banner 1: Sono Playgo 5 from $569 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between group hover:border-emerald-300 transition-all shadow-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Sono Playgo 5
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              from <span className="text-[#16A34A] font-bold">{currency === 'USD' ? '$569' : formatPrice(158000, 569)}</span>
            </p>
            <Link
              href="/products/P-1018"
              className="inline-block text-xs font-black text-slate-900 underline hover:text-emerald-600 transition-colors uppercase tracking-wider mt-4"
            >
              DISCOVER NOW
            </Link>
          </div>

          <div className="w-32 h-24 shrink-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=80"
              alt="Sono Playgo 5"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Banner 2: Logitek Bluetooth Keyboard */}
        <div className="bg-[#64748B]/30 rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between group hover:border-emerald-300 transition-all shadow-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Logitek Bluetooth
            </h3>
            <span className="text-amber-500 font-black text-base block -mt-1">
              Keyboard
            </span>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Best for all device
            </p>
          </div>

          <div className="w-32 h-24 shrink-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80"
              alt="Logitek Bluetooth Keyboard"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
