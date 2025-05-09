import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poker Advisor',
  description: 'Un assistente AI per consigli sul poker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-black text-white min-h-screen w-full">
        {children}
      </body>
    </html>
  );
} 