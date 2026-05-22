'use client';

import { X, Key, Server, Thermometer, Hash, Zap, Eye, Radio, Shield, Globe, Cpu } from 'lucide-react';
import type { AppSettings } from '@/types';
import { MIMO_MODELS } from '@/lib/mimo';

interface Props {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="ml-auto w-full max-w-md h-full bg-[var(--card)] border-l border-[var(--border)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-orange-500/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Settings</h2>
              <p className="text-[10px] text-[var(--muted)]">Configure MiMo Studio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* API Key */}
          <div className="glass-card rounded-xl p-4">
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
              <Key size={14} /> API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => update('apiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-mono"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <Shield size={10} className="text-[var(--success)]" />
              <p className="text-[10px] text-[var(--muted)]">
                Stored locally in your browser. Never sent to our servers.
              </p>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
              <Server size={14} /> Base URL
            </label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={settings.baseUrl}
                onChange={e => update('baseUrl', e.target.value)}
                placeholder="https://openrouter.ai/api/v1"
                className="w-full pl-9 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['https://openrouter.ai/api/v1', 'https://api.openai.com/v1', 'http://localhost:8000/v1'].map(url => (
                <button
                  key={url}
                  onClick={() => update('baseUrl', url)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                    settings.baseUrl === url
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {url.replace('https://', '').replace('http://', '').split('/')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-3 uppercase tracking-wider">
              <Cpu size={14} /> Model
            </label>
            <div className="space-y-2">
              {MIMO_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => update('defaultModel', model.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    settings.defaultModel === model.id
                      ? 'border-[var(--primary)] bg-gradient-to-r from-orange-500/10 to-transparent shadow-lg shadow-orange-500/5'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{model.name}</span>
                    {settings.defaultModel === model.id && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white font-bold">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] mb-2">{model.description}</div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
                    <span>ctx: {(model.contextLength / 1024).toFixed(0)}K</span>
                    <span>·</span>
                    <span>in: ${model.pricing.prompt}/M</span>
                    <span>·</span>
                    <span>out: ${model.pricing.completion}/M</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
              <Thermometer size={14} /> Temperature
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={e => update('temperature', parseFloat(e.target.value))}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="text-sm font-mono font-bold text-[var(--primary)] min-w-[2.5rem] text-right">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
              <Hash size={14} /> Max Tokens
            </label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={e => update('maxTokens', parseInt(e.target.value) || 4096)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-mono"
            />
            <div className="flex gap-1.5 mt-2">
              {[1024, 2048, 4096, 8192].map(n => (
                <button
                  key={n}
                  onClick={() => update('maxTokens', n)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                    settings.maxTokens === n
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {(n / 1024).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="glass-card rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Preferences</h4>

            {[
              { key: 'streamResponses' as const, label: 'Stream Responses', desc: 'See tokens appear in real-time', icon: Radio },
              { key: 'showReasoning' as const, label: 'Show Reasoning Traces', desc: "View MiMo's thought process", icon: Eye },
            ].map(({ key, label, desc, icon: Icon }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <Icon size={14} className="text-[var(--muted)]" /> {label}
                  </span>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5 ml-6">{desc}</p>
                </div>
                <div
                  onClick={() => update(key, !settings[key])}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                    settings[key] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            ))}
          </div>

          {/* About */}
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-orange-500/5 to-transparent p-4">
            <h4 className="text-xs font-bold mb-2 flex items-center gap-2">
              <Zap size={14} className="text-[var(--primary)]" />
              About MiMo
            </h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              MiMo is Xiaomi&apos;s open-source reasoning language model. Trained with
              reinforcement learning on math and code tasks. Supports 128K context window.
              Self-hostable via vLLM or available through OpenRouter.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <a href="https://github.com/XiaomiMiMo" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[var(--accent)] hover:underline">GitHub</a>
              <span className="text-[var(--border)]">·</span>
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[var(--accent)] hover:underline">OpenRouter</a>
              <span className="text-[var(--border)]">·</span>
              <a href="https://huggingface.co/XiaomiMiMo" target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[var(--accent)] hover:underline">HuggingFace</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
