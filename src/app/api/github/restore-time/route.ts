import { NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/github';

interface GitHubIssue {
  created_at: string;
  closed_at: string | null;
}

export async function GET() {
  try {
    const issues: GitHubIssue[] = await fetchIssues('closed', 'bug', 20);

    const restoreTimes = issues.map((issue) => {
      const opened = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at as string).getTime();
      return (closed - opened) / 1000 / 60 / 60; // hours
    });

    const avg = restoreTimes.length
      ? (
          restoreTimes.reduce((a: number, b: number) => a + b, 0) /
          restoreTimes.length
        ).toFixed(1)
      : '0';

    return NextResponse.json({ average: Number(avg) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 