import { NextResponse } from 'next/server';
import { fetchPullRequests, fetchPullRequestDetails } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];

async function getAveragePrSize(pullRequests: PullRequest[]): Promise<number> {
    if (pullRequests.length === 0) return 0;

    let totalLinesChanged = 0;
    for (const pr of pullRequests) {
        if (pr.number) {
            const prDetails = await fetchPullRequestDetails(pr.number);
            if (prDetails) {
                totalLinesChanged += prDetails.additions + prDetails.deletions;
            }
        }
    }
    return totalLinesChanged / pullRequests.length;
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
    
    const averageSizeRecent = await getAveragePrSize(recentPullRequests);
    const averageSizePrevious = await getAveragePrSize(previousPullRequests);
    
    const change = averageSizePrevious > 0 
        ? ((averageSizeRecent - averageSizePrevious) / averageSizePrevious) * 100 
        : averageSizeRecent > 0 ? 100 : 0;

    return NextResponse.json({ 
        average: averageSizeRecent,
        change: change
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 