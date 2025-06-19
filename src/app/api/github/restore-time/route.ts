import { NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/github';

export async function GET() {
  try {
    const issues = await fetchIssues('closed', 'bug', 20);

    const restoreTimes = issues.map((issue: any) => {
      const opened = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at).getTime();
      return (closed - opened) / 1000 / 60 / 60; // hours
    });

    const avg = restoreTimes.length
      ? (
          restoreTimes.reduce((a: number, b: number) => a + b, 0) /
          restoreTimes.length
        ).toFixed(1)
      : '0';

    return NextResponse.json({ averageRestoreTimeHours: avg });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
} 