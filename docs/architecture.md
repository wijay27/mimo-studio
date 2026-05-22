# Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Sidebar  │  │   Chat   │  │   Settings   │  │
│  │ Sessions │  │ Interface│  │   Panel      │  │
│  └──────────┘  └────┬─────┘  └──────────────┘  │
└──────────────────────┼──────────────────────────┘
                       │ fetch / POST /api/chat
                       ▼
┌──────────────────────────────────────────────────┐
│              Next.js Edge Runtime                 │
│  ┌──────────────────────────────────────────┐    │
│  │  /api/chat  (SSE streaming proxy)        │    │
│  │  /api/models (model catalog)             │    │
│  │  /api/health (healthcheck)               │    │
│  └──────────────────┬───────────────────────┘    │
└─────────────────────┼────────────────────────────┘
                      │ OpenAI SDK
                      ▼
┌──────────────────────────────────────────────────┐
│           MiMo API (OpenRouter / Self-hosted)     │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  MiMo 7B     │  │  MiMo 7B RL              │  │
│  │  (general)   │  │  (reasoning-enhanced)    │  │
│  └──────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Data Flow

1. User types message in `ChatInterface`
2. Message appended to session state
3. POST to `/api/chat` with messages array + model config
4. Edge API route creates OpenAI client, streams from MiMo
5. SSE chunks parsed on client — content + reasoning_content separated
6. UI updates incrementally per token
7. Token counts aggregated for session stats

## Key Design Decisions

- **Edge Runtime**: Low-latency streaming, no cold starts
- **OpenAI SDK**: Compatible with any OpenAI-format endpoint
- **Reasoning Traces**: MiMo outputs `reasoning_content` in streaming deltas — captured separately
- **BYOK**: No server-side key storage — user provides via Settings UI (localStorage) or env var
