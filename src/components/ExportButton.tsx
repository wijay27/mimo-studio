'use client';

import { useState } from 'react';
import { Download, FileText, Code, X } from 'lucide-react';
import type { ChatSession } from '@/types';

interface Props {
  session: ChatSession;
}

export default function ExportButton({ session }: Props) {
  const [open, setOpen] = useState(false);

  const exportJSON = () => {
    const data = {
      title: session.title,
      model: session.model,
      createdAt: session.createdAt,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content,
        reasoning: m.reasoning,
        timestamp: m.timestamp,
        tokenUsage: m.tokenUsage,
      })),
      totalTokens: session.totalTokens,
    };
    download(JSON.stringify(data, null, 2), `${session.title.replace(/[^a-z0-9]/gi, '_')}.json`, 'application/json');
    setOpen(false);
  };

  const exportMarkdown = () => {
    let md = `# ${session.title}\n\n`;
    md += `**Model:** ${session.model}  \n`;
    md += `**Date:** ${new Date(session.createdAt).toLocaleDateString()}  \n`;
    md += `**Tokens:** ${session.totalTokens.toLocaleString()}  \n\n---\n\n`;

    for (const msg of session.messages) {
      if (msg.role === 'user') {
        md += `## You\n\n${msg.content}\n\n`;
      } else {
        md += `## MiMo\n\n`;
        if (msg.reasoning) {
          md += `> **Reasoning:**\n> ${msg.reasoning.replace(/\n/g, '\n> ')}\n\n`;
        }
        md += `${msg.content}\n\n`;
      }
      md += `---\n\n`;
    }

    download(md, `${session.title.replace(/[^a-z0-9]/gi, '_')}.md`, 'text/markdown');
    setOpen(false);
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        title="Export chat"
      >
        <Download size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
              <span className="text-xs font-semibold">Export</span>
              <button onClick={() => setOpen(false)} className="text-[var(--muted)]"><X size={14} /></button>
            </div>
            <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--card-hover)] transition-colors">
              <Code size={14} className="text-[var(--accent)]" />
              JSON
            </button>
            <button onClick={exportMarkdown} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--card-hover)] transition-colors">
              <FileText size={14} className="text-[var(--primary)]" />
              Markdown
            </button>
          </div>
        </>
      )}
    </div>
  );
}
