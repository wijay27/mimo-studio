import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, temperature, maxTokens, stream } = await req.json();

    const apiKey = req.headers.get('x-api-key') || process.env.MIMO_API_KEY;
    const baseUrl = req.headers.get('x-base-url') || process.env.MIMO_BASE_URL || 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const client = new OpenAI({ apiKey, baseURL: baseUrl });

    if (stream) {
      const response = await client.chat.completions.create({
        model: model || 'xiaomi/mimo-7b',
        messages,
        temperature: temperature ?? 0.6,
        max_tokens: maxTokens ?? 4096,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const response = await client.chat.completions.create({
        model: model || 'xiaomi/mimo-7b',
        messages,
        temperature: temperature ?? 0.6,
        max_tokens: maxTokens ?? 4096,
      });

      return NextResponse.json({
        content: response.choices[0]?.message?.content || '',
        usage: response.usage,
        model: response.model,
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
