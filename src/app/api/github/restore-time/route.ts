import { NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Issue = components["schemas"]["issue"];

function calculateAverageRestoreTime(issues: Issue[]): number {
    if (issues.length === 0) return 0;

    const totalRestoreTime = issues.reduce((acc, issue) => {
        if (issue.created_at && issue.closed_at) {
            const createdAt = new Date(issue.created_at).getTime();
            const closedAt = new Date(issue.closed_at).getTime();
            return acc + (closedAt - createdAt);
        }
        return acc;
    }, 0);

    return (totalRestoreTime / issues.length) / (1000 * 60 * 60); // in hours
}

export async function GET() {
  try {
    const allIssues: Issue[] = await fetchIssues('closed', 'bug', 100);

    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

    const recentIssues = allIssues.filter(
        i => i.closed_at && new Date(i.closed_at) > thirtyDaysAgo
    );
    const previousIssues = allIssues.filter(
        i => i.closed_at && new Date(i.closed_at) <= thirtyDaysAgo && new Date(i.closed_at) > sixtyDaysAgo
    );

    const averageRestoreTimeRecent = calculateAverageRestoreTime(recentIssues);
    const averageRestoreTimePrevious = calculateAverageRestoreTime(previousIssues);

    const change = averageRestoreTimePrevious > 0
        ? ((averageRestoreTimeRecent - averageRestoreTimePrevious) / averageRestoreTimePrevious) * 100
        : averageRestoreTimeRecent > 0 ? 100 : 0;

    return NextResponse.json({
        average: averageRestoreTimeRecent,
        change: change
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 