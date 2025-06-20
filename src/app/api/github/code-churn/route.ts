import { NextResponse } from 'next/server';
import { fetchPullRequests, fetchPullRequestDetails } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];

async function calculateCodeChurn(pullRequests: PullRequest[]): Promise<{rate: number, additions: number, deletions: number}> {
    if (pullRequests.length === 0) return { rate: 0, additions: 0, deletions: 0 };

    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const pr of pullRequests) {
        if (pr.number) {
            const prDetails = await fetchPullRequestDetails(pr.number);
            if (prDetails) {
                totalAdditions += prDetails.additions;
                totalDeletions += prDetails.deletions;
            }
        }
    }

    const churnRate = totalAdditions > 0 ? (totalDeletions / totalAdditions) * 100 : 0;
    return { rate: churnRate, additions: totalAdditions, deletions: totalDeletions };
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

    const churnRecent = await calculateCodeChurn(recentPullRequests);
    const churnPrevious = await calculateCodeChurn(previousPullRequests);

    const change = churnPrevious.rate > 0
        ? ((churnRecent.rate - churnPrevious.rate) / churnPrevious.rate) * 100
        : churnRecent.rate > 0 ? 100 : 0;

    return NextResponse.json({
        rate: churnRecent.rate,
        change: change
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 