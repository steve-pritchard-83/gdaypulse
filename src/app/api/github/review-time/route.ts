import { NextResponse } from 'next/server';
import { fetchPullRequests, fetchPullRequestReviews } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type PullRequest = components["schemas"]["pull-request"];
type Review = components["schemas"]["pull-request-review"];

export async function GET() {
  try {
    const prs: PullRequest[] = await fetchPullRequests('closed', 20);

    let totalLeadTime = 0;
    let prCount = 0;

    for (const pr of prs) {
      if (pr.number) {
        const reviews: Review[] = await fetchPullRequestReviews(pr.number);
        if (reviews && reviews.length > 0) {
          // The first event in the reviews list is the first action.
          // We need to filter out any "comment" reviews and find the first actual "approved" or "changes_requested" review
          const firstMeaningfulReview = reviews.find(review => review.state === 'APPROVED' || review.state === 'CHANGES_REQUESTED');

          if (firstMeaningfulReview && firstMeaningfulReview.submitted_at) {
            const prCreationTime = new Date(pr.created_at).getTime();
            const firstReviewTime = new Date(firstMeaningfulReview.submitted_at).getTime();
            
            totalLeadTime += (firstReviewTime - prCreationTime);
            prCount++;
          }
        }
      }
    }

    const averageInMilliseconds = prCount > 0 ? totalLeadTime / prCount : 0;
    const averageInHours = averageInMilliseconds / 1000 / 60 / 60;


    return NextResponse.json({ average: averageInHours });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 