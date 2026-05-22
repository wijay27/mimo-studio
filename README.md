# MiMo Studio

<p align="center">
  <img src="https://img.shields.io/badge/Xiaomi-MiMo-orange" alt="MiMo" />
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

An interactive web playground for **Xiaomi MiMo** — the open-source reasoning language model. Chat with MiMo, inspect its step-by-step reasoning traces, track token usage, and compare model variants.

Built with Next.js 15, TypeScript, and Tailwind CSS. Deployed on Vercel.

![MiMo Studio Screenshot](./docs/screenshot.png)

---

## Features

- **Real-time Streaming** — SSE-powered response streaming with typing indicators
- **Reasoning Trace Viewer** — Collapsible panel showing MiMo's chain-of-thought reasoning
- **Token Usage Tracking** — Per-message and per-session token counters with cost estimates
- **Multi-Session Management** — Create, switch, and delete independent chat sessions
- **Model Selector** — Switch between MiMo 7B and MiMo 7B RL variants
- **Configurable Parameters** — Temperature, max tokens, stream toggle via Settings panel
- **BYOK (Bring Your Own Key)** — Works with any OpenAI-compatible API endpoint
- **Edge Runtime** — API routes run on Vercel Edge for low-latency responses
- **Dark Theme** — Designed for extended use, easy on the eyes
- **Responsive** — Works on desktop and mobile browsers

---

## Quick Start

### Prerequisites

- Node.js 18+
- An API key from [OpenRouter](https://openrouter.ai) or a self-hosted MiMo endpoint

### Install & Run

```bash
git clone https://github.com/wijay27/mimo-studio.git
cd mimo-studio
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API key

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wijay27/mimo-studio)

Or via CLI:

```bash
npm i -g vercel
vercel --prod
```

Set `MIMO_API_KEY` in your Vercel project environment variables.

---

## Architecture

```
mimo-studio/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Chat completions (streaming + non-streaming)
│   │   │   ├── models/route.ts    # Available model list
│   │   │   └── health/route.ts    # Health check endpoint
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── page.tsx               # Main application page
│   │   └── globals.css            # Tailwind + custom styles
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main chat UI with streaming logic
│   │   ├── MessageBubble.tsx      # Message display with reasoning toggle
│   │   ├── Sidebar.tsx            # Session list and navigation
│   │   ├── SettingsPanel.tsx      # API key, model, parameter config
│   │   └── TokenUsage.tsx         # Token counter display
│   ├── lib/
│   │   └── mimo.ts                # MiMo model definitions and client factory
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── .env.example                   # Environment variable template
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Chat completions with streaming support |
| `/api/models` | GET | List available MiMo models |
| `/api/health` | GET | Health check (status, version, runtime) |

### Chat API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "messages": [{"role": "user", "content": "Explain MiMo"}],
    "model": "xiaomi/mimo-7b",
    "stream": false
  }'
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MIMO_API_KEY` | Yes | — | Your API key |
| `MIMO_BASE_URL` | No | `https://openrouter.ai/api/v1` | API endpoint |
| `MIMO_DEFAULT_MODEL` | No | `xiaomi/mimo-7b` | Default model ID |

### Supported Models

| Model | Context | Best For |
|-------|---------|----------|
| `xiaomi/mimo-7b` | 128K | General reasoning, code, math |
| `xiaomi/mimo-7b-rl` | 128K | Complex multi-step problems |

### Self-Hosting MiMo

To run MiMo locally and point the studio at your own instance:

```bash
# Using vLLM
pip install vllm
vllm serve XiaomiMiMo/MiMo-7B-RL --port 8000

# Then in .env.local:
MIMO_BASE_URL=http://localhost:8000/v1
MIMO_API_KEY=not-needed
```

---

## How It Works

1. **Frontend** renders chat UI in Next.js App Router with `'use client'` components
2. User sends message → POST to `/api/chat`
3. **API route** creates OpenAI-compatible client, forwards to MiMo endpoint
4. If streaming: Edge runtime returns SSE events as `ReadableStream`
5. Frontend parses `data:` chunks, renders tokens incrementally
6. `reasoning_content` field in delta is captured and displayed in collapsible trace panel
7. Token counts are aggregated per-message and per-session

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Edge Runtime)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **AI Client:** OpenAI SDK (compatible with any OpenAI-format API)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/my-feature`)
3. Commit (`git commit -m 'feat: add my feature'`)
4. Push (`git push origin feat/my-feature`)
5. Open Pull Request

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Acknowledgments

- [Xiaomi LLM Core Team](https://github.com/XiaomiMiMo) for MiMo
- [OpenRouter](https://openrouter.ai) for model hosting
- [Vercel](https://vercel.com) for deployment platform
