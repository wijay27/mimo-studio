'use client';

import { X, Key, Server, Thermometer, Hash, Zap, Eye, Radio } from 'lucide-react';
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="ml-auto w-full max-w-md h-full bg-[var(--card)] border-l border-[var(--border)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-bold">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* API Key */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-2">
              <Key size={14} /> API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => update('apiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono"
            />
            <p className="text-[10px] text-[var(--muted)] mt-1">
              Stored locally in browser. Never sent to our servers.
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-2">
              <Server size={14} /> Base URL
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={e => update('baseUrl', e.target.value)}
              placeholder="https://openrouter.ai/api/v1"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* Model */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-2">
              <Zap size={14} /> Default Model
            </label>
            <div className="space-y-2">
              {MIMO_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => update('defaultModel', model.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                    settings.defaultModel === model.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className="text-sm font-semibold">{model.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">{model.description}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-1">
                    ctx: {(model.contextLength / 1024).toFixed(0)}K · ${model.pricing.prompt}/M in · ${model.pricing.completion}/M out
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-2">
              <Thermometer size={14} /> Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={e => update('temperature', parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)]">
              <span>Precise (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-2">
              <Hash size={14} /> Max Tokens
            </label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={e => update('maxTokens', parseInt(e.target.value) || 4096)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <Radio size={14} /> Stream Responses
              </span>
              <div
                onClick={() => update('streamResponses', !settings.streamResponses)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                  settings.streamResponses ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.streamResponses ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <Eye size={14} /> Show Reasoning Traces
              </span>
              <div
                onClick={() => update('showReasoning', !settings.showReasoning)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                  settings.showReasoning ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showReasoning ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
            <h4 className="text-xs font-semibold mb-2">About MiMo</h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              MiMo is Xiaomi&apos;s open-source reasoning language model. Trained with
              reinforcement learning on math and code tasks. Supports 128K context.
              Self-hostable or available via OpenRouter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
