import OpenAI from 'openai';
import type { ModelInfo } from '@/types';

export const MIMO_MODELS: ModelInfo[] = [
  {
    id: 'xiaomi/mimo-7b',
    name: 'MiMo 7B',
    description: 'Xiaomi MiMo 7B base reasoning model — strong math & code',
    contextLength: 131072,
    pricing: { prompt: 0.10, completion: 0.30 },
  },
  {
    id: 'xiaomi/mimo-7b-rl',
    name: 'MiMo 7B RL',
    description: 'MiMo 7B with RL-enhanced reasoning — best for complex problems',
    contextLength: 131072,
    pricing: { prompt: 0.12, completion: 0.36 },
  },
];

export function createMiMoClient(apiKey: string, baseUrl: string) {
  return new OpenAI({
    apiKey,
    baseURL: baseUrl,
    dangerouslyAllowBrowser: false,
  });
}

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const m = MIMO_MODELS.find(x => x.id === model);
  if (!m) return 0;
  return (promptTokens * m.pricing.prompt + completionTokens * m.pricing.completion) / 1_000_000;
}
