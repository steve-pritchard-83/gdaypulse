import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';

export async function GET() {
  try {
    const pullRequests = await fetchPullRequests('closed', 30);
    return NextResponse.json(pullRequests);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 