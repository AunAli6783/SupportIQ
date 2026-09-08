'use client';

import React from 'react';
import Link from 'next/link';

const ROW_1 = [
  { name: 'JAMIX', color: 'text-cyan-500', icon: '✦ JAMIX' },
  { name: 'Digitek', color: 'text-emerald-500', icon: 'Digitek' },
  { name: 'tek react js', color: 'text-rose-500', icon: '⚛ tek react js' },
  { name: 'Grafbase', color: 'text-amber-500', icon: '▲ Grafbase' },
  { name: 'msi', color: 'text-slate-900', icon: 'msi' }
];

const ROW_2 = [
  { name: 'ohbear', color: 'text-rose-600', icon: '🐻 ohbear' },
  { name: 'OAK', color: 'text-emerald-600', icon: 'OAK' },
  { name: 'snyk', color: 'text-slate-900', icon: 'snyk' },
  { name: 'sonex', color: 'text-slate-900', icon: 'sonex' },
  { name: 'stropi', color: 'text-blue-600', icon: 'stropi' }
];

export default function BrandBanners() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header: FEATURED BRANDS + View All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
          FEATURED BRANDS
        </h3>
        <Link 
          href="/products" 
          className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* 2 Rows of 5 Brand Logos */}
      <div className="py-4 space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-5 gap-2 items-center text-center">
          {ROW_1.map((brand, i) => (
            <Link
              key={i}
              href={`/products?q=${encodeURIComponent(brand.name)}`}
              className={`font-black text-[11px] sm:text-xs tracking-wider transition-opacity hover:opacity-100 opacity-80 ${brand.color}`}
            >
              {brand.icon}
            </Link>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-5 gap-2 items-center text-center">
          {ROW_2.map((brand, i) => (
            <Link
              key={i}
              href={`/products?q=${encodeURIComponent(brand.name)}`}
              className={`font-black text-[11px] sm:text-xs tracking-wider transition-opacity hover:opacity-100 opacity-80 ${brand.color}`}
            >
              {brand.icon}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
