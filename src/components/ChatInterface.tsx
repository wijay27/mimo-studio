'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Menu, Zap, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TokenUsage from './TokenUsage';
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

        const msgs = [...updatedMessages, assistantMsg];
        onUpdateSession(currentSession.id, { messages: msgs });

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

                const updatedMsgs = updatedMessages.map(m => m.id === userMessage.id ? m : undefined).filter(Boolean) as Message[];
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] lg:hidden">
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-semibold">{session?.title || 'MiMo Studio'}</h2>
            <p className="text-[10px] text-[var(--muted)]">{session?.model || settings.defaultModel}</p>
          </div>
        </div>
        <TokenUsage tokens={sessionTokens} />
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto chat-scroll">
        {!session || session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
              <Zap size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">MiMo Studio</h2>
            <p className="text-sm text-[var(--muted)] max-w-md mb-6">
              Xiaomi&apos;s MiMo reasoning model — strong at math, code, and step-by-step thinking.
              Start a conversation or try one of the prompts below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {[
                'Explain quantum computing in simple terms',
                'Write a Python function for merge sort',
                'Solve: if 3x + 7 = 22, find x',
                'Compare React vs Vue for a new project',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {session.messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} showReasoning={settings.showReasoning} />
            ))}
            {isLoading && (
              <div className="flex gap-3 py-4 px-4 bg-[var(--card)]/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Loader2 size={16} className="text-white animate-spin" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask MiMo anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm placeholder:text-[var(--muted)] min-h-[48px] max-h-32"
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
                className="p-3 rounded-xl bg-[var(--danger)] hover:bg-[var(--danger)]/80 text-white transition-colors"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Send size={18} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-2 text-center">
            MiMo may produce inaccurate information. Verify important outputs.
          </p>
        </div>
      </div>
    </div>
  );
}
