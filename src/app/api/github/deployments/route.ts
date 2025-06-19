import { NextResponse } from 'next/server';
import { fetchDeployments } from '@/lib/github';

export async function GET() {
  try {
    const data = await fetchDeployments();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
} 