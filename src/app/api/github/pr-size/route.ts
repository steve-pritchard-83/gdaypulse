import { NextResponse } from 'next/server';
import { fetchPullRequests, fetchPullRequestDetails } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];

export async function GET() {
  try {
    const prs: PullRequest[] = await fetchPullRequests('closed', 20);

    let totalLinesChanged = 0;
    let prCount = 0;

    for (const pr of prs) {
      if (pr.number) {
        const prDetails = await fetchPullRequestDetails(pr.number);
        if (prDetails) {
            totalLinesChanged += prDetails.additions + prDetails.deletions;
            prCount++;
        }
      }
    }

    const average = prCount > 0 ? totalLinesChanged / prCount : 0;

    return NextResponse.json({ average: average });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 