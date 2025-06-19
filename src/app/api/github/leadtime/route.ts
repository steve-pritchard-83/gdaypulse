import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';

export async function GET() {
  try {
    const prs = await fetchPullRequests('closed', 20);

    const leadTimes: number[] = prs
      .filter((pr: any) => pr.merged_at)
      .map((pr: any) => {
        const created = new Date(pr.created_at).getTime();
        const merged = new Date(pr.merged_at).getTime();
        return (merged - created) / 1000 / 60 / 60; // hours
      });

    const avg = leadTimes.length
      ? (
          leadTimes.reduce((a: number, b: number) => a + b, 0) /
          leadTimes.length
        ).toFixed(1)
      : '0';

    return NextResponse.json({ averageLeadTimeHours: avg });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
} 