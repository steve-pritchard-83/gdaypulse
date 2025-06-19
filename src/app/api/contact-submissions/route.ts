import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const now = new Date();
    
    // Current month's submission count
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfCurrentMonth = now.getTime();
    const current = await kv.zcount('submissions_log', startOfCurrentMonth, endOfCurrentMonth);

    // Previous month's submission count
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
    const previousMonthSubmissions = await kv.zcount('submissions_log', startOfPreviousMonth, endOfPreviousMonth);
    
    // Set baseline as per user request
    const baseline = previousMonthSubmissions > 0 ? previousMonthSubmissions : 10;
    
    // Calculate target
    const target = Math.ceil(baseline * 1.1);
    
    return NextResponse.json({ okr: { baseline, current, target, progress: target > 0 ? (current / target) * 100 : 0 } }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const timestamp = Date.now();
    const member = `sub:${timestamp}:${Math.random().toString(36).substring(2, 9)}`;
    
    await kv.zadd('submissions_log', { score: timestamp, member });

    return NextResponse.json({ message: 'Submission recorded' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}