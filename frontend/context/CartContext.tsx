'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';

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
  totalAmount: number;
  totalSavings: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('novacart_cart');
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
        localStorage.setItem('novacart_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart storage', e);
      }
    }
  }, [items]);

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
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
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
  };

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalOriginal = items.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const totalSavings = Math.max(0, totalOriginal - totalAmount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalSavings,
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
