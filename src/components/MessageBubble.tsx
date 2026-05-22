'use client';

import { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, Copy, Check, Brain, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import type { Message } from '@/types';

interface Props {
  message: Message;
  showReasoning: boolean;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function MessageBubble({ message, showReasoning, onRegenerate, isLast }: Props) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex gap-3 py-5 px-4 transition-colors ${isUser ? '' : 'bg-[var(--card)]/30 hover:bg-[var(--card)]/50'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/20'
          : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/20'
      }`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold tracking-wide">{isUser ? 'You' : 'MiMo'}</span>
          {message.tokenUsage && (
            <span className="text-[10px] text-[var(--muted)] px-2 py-0.5 rounded-full bg-[var(--border)]/50 font-mono">
              {message.tokenUsage.totalTokens.toLocaleString()} tok
            </span>
          )}
          <span className="text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Reasoning trace */}
        {!isUser && showReasoning && message.reasoning && (
          <div className="mb-3">
            <button
              onClick={() => setReasoningOpen(!reasoningOpen)}
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 mb-2 transition-colors"
            >
              <Brain size={14} />
              <span className="font-semibold">Reasoning Trace</span>
              <span className="text-[10px] text-[var(--muted)]">({message.reasoning.length} chars)</span>
              {reasoningOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {reasoningOpen && (
              <div className="reasoning-block rounded-xl p-4 text-xs text-[var(--muted)] font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-lg hover:bg-[var(--border)]/50 transition-all"
            >
              {copied ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-lg hover:bg-[var(--border)]/50 transition-all"
              >
                <RotateCcw size={12} />
                Regenerate
              </button>
            )}
            <button
              onClick={() => setReaction(reaction === 'up' ? null : 'up')}
              className={`p-1 rounded-lg transition-all ${reaction === 'up' ? 'text-[var(--success)] bg-[var(--success)]/10' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/50'}`}
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => setReaction(reaction === 'down' ? null : 'down')}
              className={`p-1 rounded-lg transition-all ${reaction === 'down' ? 'text-[var(--danger)] bg-[var(--danger)]/10' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/50'}`}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
