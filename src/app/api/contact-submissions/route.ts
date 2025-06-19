import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const submissions = await kv.get<number>('submissions');
    return NextResponse.json({ submissions: submissions ?? 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    // If the store is not configured, return 0 instead of failing
    if (message.includes('KV_URL environment variable is not set')) {
      return NextResponse.json({ submissions: 0 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const newCount = await kv.incr('submissions');
    return NextResponse.json({
      message: 'Submission recorded',
      submissions: newCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 