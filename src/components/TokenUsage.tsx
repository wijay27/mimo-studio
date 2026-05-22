'use client';

import { Activity } from 'lucide-react';
import type { TokenUsage as TokenUsageType } from '@/types';

interface Props {
  tokens: TokenUsageType;
}

export default function TokenUsage({ tokens }: Props) {
  if (tokens.totalTokens === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
      <Activity size={14} className="text-[var(--primary)]" />
      <span>{tokens.totalTokens.toLocaleString()} tokens</span>
    </div>
  );
}
