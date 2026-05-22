'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Menu, Zap, Loader2, BookOpen, Command } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TokenUsage from './TokenUsage';
import ExportButton from './ExportButton';
import PromptTemplates from './PromptTemplates';
import type { ChatSession, AppSettings, Message, TokenUsage as TokenUsageType } from '@/types';

interface Props {
  session: ChatSession | null;
  settings: AppSettings;
  onCreateSession: () => ChatSession;
  onUpdateSession: (id: string, updates: Partial<ChatSession>) => void;
  onToggleSidebar: () => void;
}

export default function ChatInterface({ session, settings, onCreateSession, onUpdateSession, onToggleSidebar }: Props) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [sessionTokens, setSessionTokens] = useState<TokenUsageType>({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
  const [showPrompts, setShowPrompts] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [session?.messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [session?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') { e.preventDefault(); setShowPrompts(true); }
        if (e.key === '/') { e.preventDefault(); setShowShortcuts(s => !s); }
        if (e.key === 'n') { e.preventDefault(); onCreateSession(); }
      }
      if (e.key === 'Escape') {
        setShowPrompts(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCreateSession]);

  const generateTitle = (content: string) => {
    const words = content.split(' ').slice(0, 6).join(' ');
    return words.length > 40 ? words.slice(0, 40) + '...' : words;
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    let currentSession = session;
    if (!currentSession) {
      currentSession = onCreateSession();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    onUpdateSession(currentSession.id, {
      messages: updatedMessages,
      title: currentSession.messages.length === 0 ? generateTitle(input.trim()) : currentSession.title,
    });
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (settings.apiKey) headers['x-api-key'] = settings.apiKey;
      if (settings.baseUrl) headers['x-base-url'] = settings.baseUrl;

      if (settings.streamResponses) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: apiMessages,
            model: currentSession.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Request failed');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let reasoning = '';
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        onUpdateSession(currentSession.id, { messages: [...updatedMessages, assistantMsg] });

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const chunk = JSON.parse(data);
                const delta = chunk.choices?.[0]?.delta;
                if (delta?.content) content += delta.content;
                if (delta?.reasoning_content) reasoning += delta.reasoning_content;

                onUpdateSession(currentSession!.id, {
                  messages: [...updatedMessages, { ...assistantMsg, content, reasoning }],
                });
              } catch {}
            }
          }

          const usage: TokenUsageType = {
            promptTokens: 0,
            completionTokens: Math.ceil(content.length / 4),
            totalTokens: Math.ceil(content.length / 4),
          };
          setSessionTokens(prev => ({
            promptTokens: prev.promptTokens + usage.promptTokens,
            completionTokens: prev.completionTokens + usage.completionTokens,
            totalTokens: prev.totalTokens + usage.totalTokens,
          }));
          onUpdateSession(currentSession!.id, {
            totalTokens: currentSession!.totalTokens + usage.totalTokens,
          });
        }
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: apiMessages,
            model: currentSession.model,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            stream: false,
          }),
          signal: controller.signal,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          tokenUsage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
        };

        onUpdateSession(currentSession!.id, { messages: [...updatedMessages, assistantMsg] });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      onUpdateSession(currentSession!.id, { messages: [...updatedMessages, errorMsg] });
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [input, isLoading, session, settings, onCreateSession, onUpdateSession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen relative">
      <div className="gradient-bg" />
      <div className="grid-pattern fixed inset-0 z-[-1]" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] status-dot" />
            <div>
              <h2 className="text-sm font-bold">{session?.title || 'MiMo Studio'}</h2>
              <p className="text-[10px] text-[var(--muted)] font-mono">{session?.model || settings.defaultModel}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TokenUsage tokens={sessionTokens} />
          {session && session.messages.length > 0 && <ExportButton session={session} />}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]"
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Command size={16} />
          </button>
        </div>
      </div>

      {/* Shortcuts panel */}
      {showShortcuts && (
        <div className="absolute top-14 right-4 z-40 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-2xl">
          <h3 className="text-xs font-bold mb-3 text-[var(--muted)] uppercase tracking-wider">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            {[
              ['Ctrl+K', 'Prompt templates'],
              ['Ctrl+N', 'New chat'],
              ['Ctrl+/', 'Toggle shortcuts'],
              ['Enter', 'Send message'],
              ['Shift+Enter', 'New line'],
              ['Escape', 'Close panels'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">{desc}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--border)] text-[10px] font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto chat-scroll">
        {!session || session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center float-animation shadow-2xl shadow-orange-500/20">
                <Zap size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              MiMo Studio
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-md mb-6 leading-relaxed">
              Xiaomi&apos;s MiMo reasoning model — excels at math, code, and step-by-step thinking.
              Start a conversation or pick a template below.
            </p>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowPrompts(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                <BookOpen size={16} />
                Prompt Templates
                <kbd className="text-[10px] opacity-70 bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {[
                { text: 'Explain quantum computing', icon: '🔬' },
                { text: 'Write merge sort in Python', icon: '🐍' },
                { text: 'Solve: 3x + 7 = 22', icon: '🧮' },
                { text: 'Compare React vs Vue', icon: '⚡' },
              ].map(({ text, icon }) => (
                <button
                  key={text}
                  onClick={() => setInput(text)}
                  className="prompt-card text-left text-xs px-4 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card)] transition-all flex items-center gap-2"
                >
                  <span>{icon}</span>
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {session.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                showReasoning={settings.showReasoning}
                isLast={i === session.messages.length - 1 && msg.role === 'assistant'}
                onRegenerate={handleSend}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 py-5 px-4 bg-[var(--card)]/30">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Loader2 size={15} className="text-white animate-spin" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <span className="text-xs text-[var(--muted)] ml-2">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowPrompts(true)}
              className="p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] text-[var(--muted)] hover:text-[var(--primary)] transition-all"
              title="Prompt templates (Ctrl+K)"
            >
              <BookOpen size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MiMo anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted)] min-h-[48px] max-h-32 transition-all"
                style={{ height: 'auto' }}
                onInput={e => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            {isLoading ? (
              <button
                onClick={() => abortController?.abort()}
                className="p-3 rounded-xl bg-[var(--danger)] hover:bg-[var(--danger)]/80 text-white transition-colors shadow-lg shadow-red-500/20"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
              >
                <Send size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-[var(--muted)]">
              MiMo may produce inaccurate information. Verify important outputs.
            </p>
            <p className="text-[10px] text-[var(--muted)]">
              <kbd className="px-1 py-0.5 rounded bg-[var(--border)] text-[9px] font-mono">⌘K</kbd> templates
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Templates Modal */}
      {showPrompts && (
        <PromptTemplates
          onSelect={setInput}
          onClose={() => setShowPrompts(false)}
        />
      )}
    </div>
  );
}
