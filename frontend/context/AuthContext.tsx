'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string; // e.g. "CUS-001"
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'CUS-001',
    name: 'Ali Raza',
    email: 'ali.raza@example.pk',
    phone: '+92 300 1234567',
    address: 'House 42-B, Street 9, F-7/2',
    city: 'Islamabad'
  },
  {
    id: 'CUS-002',
    name: 'Sara Khan',
    email: 'sara.khan@techcorp.pk',
    phone: '+92 321 9876543',
    address: 'Apartment 402, Creek Vistas, Phase 8, DHA',
    city: 'Karachi'
  },
  {
    id: 'CUS-003',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@innovate.pk',
    phone: '+92 333 5556677',
    address: 'Plot 18, Sector Y, Phase 3, DHA',
    city: 'Lahore'
  }
];

interface AuthContextType {
  user: UserProfile | null;
  currency: 'USD' | 'PKR';
  setCurrency: (currency: 'USD' | 'PKR') => void;
  formatPrice: (pkr: number, usd?: number) => string;
  loginAs: (userId: string) => void;
  loginWithCustom: (profile: { name: string; email: string; phone?: string; address?: string; city?: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMessage: string;
  openAuthModal: (onSuccess?: () => void, message?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, message?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD'); // Default to USD as shown in Figma
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Sign in to continue shopping, add to cart, and track orders.');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('swoo_user');
    const savedCurrency = localStorage.getItem('swoo_currency');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
        }
      } catch (e) {
        setUser(null);
      }
    }
    if (savedCurrency === 'PKR' || savedCurrency === 'USD') {
      setCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      if (user) {
        localStorage.setItem('swoo_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('swoo_user');
      }
    }
  }, [user, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('swoo_currency', currency);
    }
  }, [currency, mounted]);

  const executePending = () => {
    if (pendingAction) {
      try {
        pendingAction();
      } catch (e) {
        console.error('Failed to execute pending auth action', e);
      }
      setPendingAction(null);
    }
  };

  const loginAs = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      setIsAuthModalOpen(false);
      setTimeout(() => {
        executePending();
      }, 50);
    }
  };

  const loginWithCustom = (profile: { name: string; email: string; phone?: string; address?: string; city?: string }) => {
    const randomId = `CUS-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserProfile = {
      id: randomId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '+92 300 0000000',
      address: profile.address || 'Street 10, F-8/3',
      city: profile.city || 'Islamabad'
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    setTimeout(() => {
      executePending();
    }, 50);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swoo_user');
  };

  const openAuthModal = (onSuccess?: () => void, message?: string) => {
    if (onSuccess) setPendingAction(() => onSuccess);
    if (message) setAuthModalMessage(message);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (action: () => void, message?: string): boolean => {
    if (user) {
      action();
      return true;
    }
    openAuthModal(action, message || 'Sign in to add items to your cart, place orders, and view isolated purchases.');
    return false;
  };

  const formatPrice = (pkr: number, usd?: number) => {
    if (currency === 'USD') {
      const amt = usd !== undefined ? usd : Math.round(pkr / 280);
      return `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${pkr.toLocaleString()} PKR`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currency,
        setCurrency,
        formatPrice,
        loginAs,
        loginWithCustom,
        logout,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
