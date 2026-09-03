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
  loginAs: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USERS[0]); // Default to Ali Raza for seamless demo
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('novacart_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(DEMO_USERS[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && user) {
      localStorage.setItem('novacart_user', JSON.stringify(user));
    }
  }, [user, mounted]);

  const loginAs = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('novacart_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        logout,
        isAuthenticated: !!user,
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
