import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'MiMo Studio — Xiaomi AI Reasoning Playground',
  description: 'Interactive playground for Xiaomi MiMo reasoning models. Chat, analyze, and explore AI reasoning traces with streaming, token tracking, and prompt templates.',
  keywords: ['MiMo', 'Xiaomi', 'AI', 'reasoning', 'LLM', 'playground', 'chat', 'open-source'],
  authors: [{ name: 'MiMo Studio Contributors' }],
  openGraph: {
    title: 'MiMo Studio',
    description: 'Xiaomi MiMo AI Reasoning Playground — Chat, Reason, Build',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
