import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MiMo Studio — Xiaomi AI Reasoning Playground',
  description: 'Interactive playground for Xiaomi MiMo reasoning models. Chat, analyze, and explore AI reasoning traces.',
  keywords: ['MiMo', 'Xiaomi', 'AI', 'reasoning', 'LLM', 'playground'],
  authors: [{ name: 'MiMo Studio Contributors' }],
  openGraph: {
    title: 'MiMo Studio',
    description: 'Xiaomi MiMo AI Reasoning Playground',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
