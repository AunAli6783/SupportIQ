import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaCart SupportIQ — AI Customer Support Assistant",
  description: "AI-powered intelligent customer support assistant built with Next.js, FastAPI, RAG, and ChromaDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
