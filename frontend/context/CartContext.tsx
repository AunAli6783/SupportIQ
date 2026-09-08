'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, PRODUCTS } from '../data/products';
import { useAuth } from './AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: (customerId?: string) => Promise<void>;
  totalAmount: number; // PKR
  totalAmountUsd: number; // USD
  totalSavings: number;
  totalSavingsUsd: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('swoo_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cart storage', e);
      }
    }
    return [];
  });

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('swoo_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart storage', e);
      }
    }
  }, [items]);

  // Sync with backend SQLite database
  const refreshCart = useCallback(async (targetUserId?: string) => {
    const custId = targetUserId || user?.id;
    if (!custId) return;
    try {
      const res = await fetch(`${API_BASE}/store/cart/${custId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          const mapped: CartItem[] = data.items.map((it: any) => {
            const foundProd = PRODUCTS.find((p) => p.id === it.product_id);
            const prod: Product = foundProd || {
              id: it.product_id,
              name: it.product?.name || it.product_id,
              brand: (it.product?.brand || 'Apple') as any,
              category: (it.product?.category || 'Accessories') as any,
              price: it.product?.price || 10000,
              priceUsd: Math.round((it.product?.price || 10000) / 280),
              originalPrice: (it.product?.price || 10000) * 1.15,
              originalPriceUsd: Math.round(((it.product?.price || 10000) * 1.15) / 280),
              discountPercent: 15,
              stock: it.product?.stock || 50,
              rating: it.product?.rating || 4.9,
              reviewsCount: it.product?.reviews_count || 120,
              image: it.product?.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
              tagline: it.product?.tagline || 'Guaranteed Hardware',
              description: it.product?.description || '',
              specs: { warranty: '1 Year Warranty' }
            };
            return {
              product: prod,
              quantity: it.quantity
            };
          });
          setItems(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend cart synchronization offline, using local state:', err);
    }
  }, [user?.id]);

  // Auto-fetch DB cart on user change
  useEffect(() => {
    if (user?.id) {
      refreshCart(user.id);
    }
  }, [user?.id, refreshCart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product || !product.id) return;
    const addQty = Math.max(1, quantity || 1);
    const maxStock = (product.stock && product.stock > 0) ? product.stock : 99;

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + addQty, maxStock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(addQty, maxStock) }];
    });

    // Synchronize asynchronously with database
    const custId = user?.id || 'CUS-001';
    fetch(`${API_BASE}/store/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: custId,
        product_id: product.id,
        quantity: addQty
      })
    }).catch((e) => console.warn('Async DB cart add failed:', e));
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    
    const custId = user?.id || 'CUS-001';
    fetch(`${API_BASE}/store/cart/${custId}/${productId}`, {
      method: 'DELETE'
    }).catch((e) => console.warn('Async DB cart remove failed:', e));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const maxStock = (item.product.stock && item.product.stock > 0) ? item.product.stock : 99;
        return { ...item, quantity: Math.min(quantity, maxStock) };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    const custId = user?.id || 'CUS-001';
    fetch(`${API_BASE}/store/cart/${custId}`, {
      method: 'DELETE'
    }).catch((e) => console.warn('Async DB cart clear failed:', e));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmountUsd = items.reduce((sum, item) => sum + (item.product.priceUsd || Math.round(item.product.price / 280)) * item.quantity, 0);
  const totalOriginal = items.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const totalOriginalUsd = items.reduce((sum, item) => sum + (item.product.originalPriceUsd || Math.round(item.product.originalPrice / 280)) * item.quantity, 0);
  const totalSavings = Math.max(0, totalOriginal - totalAmount);
  const totalSavingsUsd = Math.max(0, totalOriginalUsd - totalAmountUsd);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        totalAmount,
        totalAmountUsd,
        totalSavings,
        totalSavingsUsd,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

