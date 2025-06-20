import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];

function calculateAverageLeadTime(pullRequests: PullRequest[]): number {
    const totalLeadTime = pullRequests.reduce((acc, pr) => {
        if (pr.created_at && pr.merged_at) {
            const createdAt = new Date(pr.created_at).getTime();
            const mergedAt = new Date(pr.merged_at).getTime();
            return acc + (mergedAt - createdAt);
        }
        return acc;
    }, 0);

    return pullRequests.length > 0 ? (totalLeadTime / pullRequests.length) / (1000 * 60 * 60) : 0; // in hours
}

export async function GET() {
  try {
    const allPullRequests: PullRequest[] = await fetchPullRequests('closed', 100);
    
    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

    const recentPullRequests = allPullRequests.filter(
      pr => pr.merged_at && new Date(pr.merged_at) > thirtyDaysAgo
    );
    const previousPullRequests = allPullRequests.filter(
      pr => pr.merged_at && new Date(pr.merged_at) <= thirtyDaysAgo && new Date(pr.merged_at) > sixtyDaysAgo
    );

    const averageLeadTimeRecent = calculateAverageLeadTime(recentPullRequests);
    const averageLeadTimePrevious = calculateAverageLeadTime(previousPullRequests);
    
    const change = averageLeadTimePrevious > 0 
        ? ((averageLeadTimeRecent - averageLeadTimePrevious) / averageLeadTimePrevious) * 100 
        : averageLeadTimeRecent > 0 ? 100 : 0;

    return NextResponse.json({ 
        average: averageLeadTimeRecent,
        change: change 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 