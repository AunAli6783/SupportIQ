import './globals.css';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/store/Navbar';
import Footer from '../components/store/Footer';
import FloatingAiWidget from '../components/ai/FloatingAiWidget';
import AuthModal from '../components/store/AuthModal';

export const metadata = {
  title: 'SWOO TECH MART — Next-Gen Tech Store & AI Support',
  description: 'Premier multi-purpose e-commerce store for 2026 tech products: iPhones, Samsung Galaxy AI, MacBooks, ROG gaming, and audio gear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingAiWidget />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
