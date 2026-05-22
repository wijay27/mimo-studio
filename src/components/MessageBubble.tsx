'use client';

import { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, Copy, Check, Brain } from 'lucide-react';
import type { Message } from '@/types';

interface Props {
  message: Message;
  showReasoning: boolean;
}

export default function MessageBubble({ message, showReasoning }: Props) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 py-4 px-4 ${isUser ? '' : 'bg-[var(--card)]/50'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
          : 'bg-gradient-to-br from-orange-500 to-red-600'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">{isUser ? 'You' : 'MiMo'}</span>
          {message.tokenUsage && (
            <span className="text-[10px] text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--border)]/50">
              {message.tokenUsage.totalTokens} tokens
            </span>
          )}
        </div>

        {/* Reasoning trace */}
        {!isUser && showReasoning && message.reasoning && (
          <div className="mb-3">
            <button
              onClick={() => setReasoningOpen(!reasoningOpen)}
              className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 mb-2"
            >
              <Brain size={14} />
              Reasoning Trace
              {reasoningOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {reasoningOpen && (
              <div className="reasoning-block rounded-lg p-3 text-xs text-[var(--muted)] font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Message text */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--border)]/50"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
