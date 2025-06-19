import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';

interface GitHubPullRequest {
  merged_at: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const prs: GitHubPullRequest[] = await fetchPullRequests('closed', 20);

    const leadTimes: number[] = prs
      .filter((pr) => pr.merged_at)
      .map((pr) => {
        const created = new Date(pr.created_at).getTime();
        const merged = new Date(pr.merged_at as string).getTime();
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
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 