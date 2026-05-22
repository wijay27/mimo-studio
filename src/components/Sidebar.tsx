'use client';

import { Plus, MessageSquare, Settings, Trash2, PanelLeftClose, PanelLeft, Zap } from 'lucide-react';
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
  if (!isOpen) {
    return (
      <div className="w-12 flex flex-col items-center py-4 border-r border-[var(--border)] bg-[var(--card)]">
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
          <PanelLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 flex flex-col border-r border-[var(--border)] bg-[var(--card)] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">MiMo Studio</h1>
            <p className="text-[10px] text-[var(--muted)]">Xiaomi AI Reasoning</p>
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
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)] transition-all text-sm"
        >
          <Plus size={16} className="text-[var(--primary)]" />
          New Chat
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <div className="text-center text-[var(--muted)] text-xs mt-8">
            No conversations yet.<br />Start a new chat to begin.
          </div>
        ) : (
          sessions.map(s => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s)}
              className={`sidebar-item group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 ${
                activeSession?.id === s.id ? 'active' : ''
              }`}
            >
              <MessageSquare size={14} className="text-[var(--muted)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{s.title}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {s.messages.length} msgs · {s.totalTokens.toLocaleString()} tokens
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--danger)]/20 text-[var(--muted)] hover:text-[var(--danger)] transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card-hover)] text-sm text-[var(--muted)]"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}
