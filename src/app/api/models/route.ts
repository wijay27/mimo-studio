import { NextResponse } from 'next/server';
import { MIMO_MODELS } from '@/lib/mimo';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ models: MIMO_MODELS });
}
