import { NextResponse } from 'next/server';
import { fetchPullRequests, fetchPullRequestReviews } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];

async function getAverageReviewTime(pullRequests: PullRequest[]): Promise<number> {
    if (pullRequests.length === 0) return 0;

    let totalReviewTime = 0;
    let reviewedPrCount = 0;

    for (const pr of pullRequests) {
        if (pr.number) {
            const reviews = await fetchPullRequestReviews(pr.number);
            if (reviews.length > 0) {
                const createdAt = new Date(pr.created_at).getTime();
                const firstReviewAt = new Date(reviews[0].submitted_at as string).getTime();
                totalReviewTime += firstReviewAt - createdAt;
                reviewedPrCount++;
            }
        }
    }

    return reviewedPrCount > 0 ? (totalReviewTime / reviewedPrCount) / (1000 * 60 * 60) : 0; // in hours
}

export async function GET() {
  try {
    const allPullRequests: PullRequest[] = await fetchPullRequests('all', 100);

    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

    const recentPullRequests = allPullRequests.filter(
      pr => pr.created_at && new Date(pr.created_at) > thirtyDaysAgo
    );
    const previousPullRequests = allPullRequests.filter(
      pr => pr.created_at && new Date(pr.created_at) <= thirtyDaysAgo && new Date(pr.created_at) > sixtyDaysAgo
    );

    const averageReviewTimeRecent = await getAverageReviewTime(recentPullRequests);
    const averageReviewTimePrevious = await getAverageReviewTime(previousPullRequests);

    const change = averageReviewTimePrevious > 0
        ? ((averageReviewTimeRecent - averageReviewTimePrevious) / averageReviewTimePrevious) * 100
        : averageReviewTimeRecent > 0 ? 100 : 0;

    return NextResponse.json({
        average: averageReviewTimeRecent,
        change: change
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 