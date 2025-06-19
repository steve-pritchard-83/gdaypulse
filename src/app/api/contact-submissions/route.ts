import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  const submissions = await kv.get<number>('submissions');
  return NextResponse.json({ submissions: submissions ?? 0 });
}

export async function POST() {
  const newCount = await kv.incr('submissions');
  return NextResponse.json({
    message: 'Submission recorded',
    submissions: newCount,
  });
} 