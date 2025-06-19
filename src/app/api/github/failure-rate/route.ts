import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';

export async function GET() {
  try {
    const prs = await fetchPullRequests('closed', 50);

    const bugFixes = prs.filter((pr: any) =>
      pr.labels?.some((label: any) =>
        label.name.toLowerCase().includes('bug')
      )
    ).length;

    const total = prs.length;
    const rate = total ? ((bugFixes / total) * 100).toFixed(1) : '0';

    return NextResponse.json({ changeFailureRatePercent: rate });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
} 