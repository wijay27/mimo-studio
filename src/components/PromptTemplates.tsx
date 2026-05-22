'use client';

import { useState } from 'react';
import { BookOpen, Code, Calculator, Lightbulb, X, Search, Sparkles, Globe, Palette } from 'lucide-react';

interface Props {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

const TEMPLATES = [
  {
    category: 'Reasoning',
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-600',
    prompts: [
      { title: 'Step-by-step Math', prompt: 'Solve this step by step, showing your reasoning at each stage: Find the integral of x²·eˣ dx' },
      { title: 'Logic Puzzle', prompt: 'Three people (A, B, C) each make two statements. One always lies, one always tells the truth, one alternates. Figure out who is who and explain your deduction process.' },
      { title: 'Probability Problem', prompt: 'A bag contains 5 red, 3 blue, and 2 green marbles. If I draw 3 without replacement, what is the probability of getting exactly 2 red? Show all steps.' },
    ],
  },
  {
    category: 'Code',
    icon: Code,
    color: 'from-blue-500 to-cyan-600',
    prompts: [
      { title: 'Algorithm Design', prompt: 'Design an efficient algorithm to find the longest palindromic substring. Explain the approach, write the code, and analyze time/space complexity.' },
      { title: 'Code Review', prompt: 'Review this code for bugs, performance issues, and best practices. Suggest improvements:\n\n```python\ndef find_duplicates(lst):\n    duplicates = []\n    for i in range(len(lst)):\n        for j in range(i+1, len(lst)):\n            if lst[i] == lst[j] and lst[i] not in duplicates:\n                duplicates.append(lst[i])\n    return duplicates\n```' },
      { title: 'System Design', prompt: 'Design a URL shortener service like bit.ly. Cover: architecture, database schema, API design, caching strategy, and how to handle high traffic.' },
    ],
  },
  {
    category: 'Analysis',
    icon: Search,
    color: 'from-purple-500 to-violet-600',
    prompts: [
      { title: 'Compare Frameworks', prompt: 'Compare React, Vue, and Svelte in 2026. Cover: performance, DX, ecosystem, learning curve, and best use cases. Use a structured comparison.' },
      { title: 'Trade Analysis', prompt: 'Analyze the pros and cons of using microservices vs monolithic architecture for a startup with 5 engineers building an e-commerce platform.' },
      { title: 'Market Research', prompt: 'What are the top 3 trends in AI/ML for 2026? For each, explain the technology, key players, market size, and investment opportunities.' },
    ],
  },
  {
    category: 'Creative',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
    prompts: [
      { title: 'Technical Blog Post', prompt: 'Write a technical blog post about how transformer attention mechanisms work. Make it accessible to junior developers with analogies and diagrams described in text.' },
      { title: 'API Documentation', prompt: 'Write comprehensive API documentation for a REST API that manages a todo list. Include endpoints, request/response examples, error codes, and authentication.' },
      { title: 'README Generator', prompt: 'Generate a professional README.md for an open-source CLI tool that converts CSV files to JSON. Include badges, installation, usage examples, contributing guide, and license.' },
    ],
  },
  {
    category: 'Data',
    icon: Globe,
    color: 'from-emerald-500 to-teal-600',
    prompts: [
      { title: 'SQL Query Builder', prompt: 'I have tables: users(id, name, email, created_at), orders(id, user_id, total, status, created_at), products(id, name, price, category). Write a query to find the top 10 customers by total spending in the last 30 days, grouped by product category.' },
      { title: 'Data Pipeline', prompt: 'Design a data pipeline architecture for processing 10M events/day from IoT sensors. Cover: ingestion, processing, storage, and real-time dashboard requirements.' },
      { title: 'Python Data Analysis', prompt: 'Write a Python script using pandas to analyze a CSV dataset of sales data. Include: data cleaning, summary statistics, trend analysis, and visualization recommendations.' },
    ],
  },
  {
    category: 'Explain',
    icon: BookOpen,
    color: 'from-orange-500 to-red-600',
    prompts: [
      { title: 'ELI5 Quantum Computing', prompt: 'Explain quantum computing like I am 10 years old. Use everyday analogies, avoid jargon, and build up from basic concepts.' },
      { title: 'How LLMs Work', prompt: 'Explain how large language models work from tokenization to generation. Cover: embeddings, attention, transformer architecture, and sampling strategies.' },
      { title: 'Blockchain Deep Dive', prompt: 'Explain blockchain technology in depth: consensus mechanisms, cryptographic hashing, smart contracts, and the trilemma problem. Structure it as a progressive tutorial.' },
    ],
  },
];

export default function PromptTemplates({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = TEMPLATES.map(cat => ({
    ...cat,
    prompts: cat.prompts.filter(p =>
      (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.prompt.toLowerCase().includes(search.toLowerCase())) &&
      (!activeCategory || cat.category === activeCategory)
    ),
  })).filter(cat => cat.prompts.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--primary)]" />
            <h2 className="text-sm font-bold">Prompt Templates</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
            <X size={18} />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                !activeCategory ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
              }`}
            >
              All
            </button>
            {TEMPLATES.map(cat => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeCategory === cat.category ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filtered.map(cat => (
            <div key={cat.category}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <cat.icon size={12} className="text-white" />
                </div>
                <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{cat.category}</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {cat.prompts.map(p => (
                  <button
                    key={p.title}
                    onClick={() => { onSelect(p.prompt); onClose(); }}
                    className="prompt-card text-left p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--background)] transition-all"
                  >
                    <div className="text-sm font-semibold mb-1">{p.title}</div>
                    <div className="text-[11px] text-[var(--muted)] line-clamp-2">{p.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
