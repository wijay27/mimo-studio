'use client';

import { Plus, MessageSquare, Settings, Trash2, PanelLeftClose, PanelLeft, Zap, Search, Hash } from 'lucide-react';
import { useState } from 'react';
import type { ChatSession } from '@/types';

interface Props {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  onCreateSession: () => void;
  onSelectSession: (s: ChatSession) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ sessions, activeSession, onCreateSession, onSelectSession, onDeleteSession, onOpenSettings, isOpen, onToggle }: Props) {
  const [search, setSearch] = useState('');

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  const totalTokensAll = sessions.reduce((a, s) => a + s.totalTokens, 0);

  if (!isOpen) {
    return (
      <div className="w-12 flex flex-col items-center py-4 border-r border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl">
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
          <PanelLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 flex flex-col border-r border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 relative">
            <Zap size={18} className="text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--success)] border-2 border-[var(--card)] status-dot" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">MiMo Studio</h1>
            <p className="text-[10px] text-[var(--muted)]">v1.0 · Xiaomi AI</p>
          </div>
        </div>
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onCreateSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20 hover:border-orange-500/40 hover:from-orange-500/15 hover:to-red-600/15 transition-all text-sm font-semibold text-[var(--primary)]"
        >
          <Plus size={16} />
          New Chat
          <kbd className="text-[9px] opacity-50 bg-[var(--border)]/50 px-1.5 py-0.5 rounded font-mono">⌘N</kbd>
        </button>
      </div>

      {/* Search */}
      {sessions.length > 0 && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2">
        {filtered.length === 0 ? (
          <div className="text-center text-[var(--muted)] text-xs mt-8 px-4">
            {sessions.length === 0 ? (
              <>
                <div className="text-2xl mb-2">💬</div>
                No conversations yet.<br />
                Start a new chat to begin.
              </>
            ) : (
              'No matching chats found.'
            )}
          </div>
        ) : (
          filtered.map(s => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s)}
              className={`sidebar-item group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all ${
                activeSession?.id === s.id ? 'active bg-[var(--card-hover)]' : ''
              }`}
            >
              <MessageSquare size={14} className="text-[var(--muted)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate font-medium">{s.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                  <span>{s.messages.length} msgs</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Hash size={10} />
                    {s.totalTokens.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--danger)]/20 text-[var(--muted)] hover:text-[var(--danger)] transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>{sessions.length} chats</span>
            <span>{totalTokensAll.toLocaleString()} total tokens</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--card-hover)] text-sm text-[var(--muted)] transition-colors"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}
