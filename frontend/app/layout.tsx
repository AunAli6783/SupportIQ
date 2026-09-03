import './globals.css';
import React from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/store/Navbar';
import Footer from '../components/store/Footer';
import FloatingAiWidget from '../components/ai/FloatingAiWidget';

export const metadata = {
  title: 'NovaCart — Next-Gen Tech Store & AI Support',
  description: 'Premier e-commerce store for 2024–2026 AI laptops, flagship smartphones, and professional creator gear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F4F7F9] text-slate-800 antialiased selection:bg-[#008ECC] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingAiWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
