'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import type { ChatSession, AppSettings, Message } from '@/types';

const defaultSettings: AppSettings = {
  apiKey: '',
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'xiaomi/mimo-7b',
  temperature: 0.6,
  maxTokens: 4096,
  streamResponses: true,
  showReasoning: true,
  theme: 'dark',
};

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const createSession = useCallback(() => {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      model: settings.defaultModel,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTokens: 0,
    };
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    return session;
  }, [settings.defaultModel]);

  const updateSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s));
    setActiveSession(prev => prev?.id === id ? { ...prev, ...updates, updatedAt: new Date() } : prev);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setActiveSession(prev => prev?.id === id ? null : prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        onCreateSession={createSession}
        onSelectSession={setActiveSession}
        onDeleteSession={deleteSession}
        onOpenSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          session={activeSession}
          settings={settings}
          onCreateSession={createSession}
          onUpdateSession={updateSession}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </main>
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
