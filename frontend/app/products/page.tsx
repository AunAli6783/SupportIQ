'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import ProductCard from '../../components/store/ProductCard';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function CatalogContent() {
  const searchParams = useSearchParams();
  const { currency, formatPrice } = useAuth();
  
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState(600000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const brands = useMemo(() => {
    return ['all', ...Array.from(new Set(PRODUCTS.map((p) => p.brand)))];
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pText = `${p.name} ${p.brand} ${p.category} ${p.description} ${p.tagline}`.toLowerCase();
        
        // Exact substring
        if (pText.includes(q)) {
          // match!
        } else {
          // Check normalized keywords (e.g. "iphones" -> "iphone")
          const keywords = q.split(/\s+/).map(k => (k.endsWith('s') && k.length > 3 ? k.slice(0, -1) : k));
          const allKeywordsMatch = keywords.every(kw => pText.includes(kw));
          if (!allKeywordsMatch) return false;
        }
      }
      // Price ceiling
      if (p.price > maxPrice) return false;
      // Stock
      if (inStockOnly && p.stock <= 0) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [selectedCategory, selectedBrand, searchQuery, maxPrice, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setMaxPrice(600000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            SWOO <span className="text-emerald-600">Tech Mart Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing {filteredProducts.length} verified 2026 tech products & accessories
          </p>
        </div>

        {/* SORT DROPDOWN */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="featured">✨ Featured & Best Deals</option>
            <option value="price-low">💵 Price: Low to High</option>
            <option value="price-high">💎 Price: High to Low</option>
            <option value="rating">⭐ Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Category</h4>
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Brand</h4>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedBrand === b
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b === 'all' ? 'All Brands' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Max Price</h4>
              <span className="text-xs font-bold text-emerald-600">
                {formatPrice(maxPrice, Math.round(maxPrice / 280))}
              </span>
            </div>
            <input
              type="range"
              min={20000}
              max={600000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* In Stock Only */}
          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-700">In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT: PRODUCT GRID */}
        <main className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-800 uppercase">No Matching Tech Products Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search criteria or reset your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading SWOO TECH MART Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
