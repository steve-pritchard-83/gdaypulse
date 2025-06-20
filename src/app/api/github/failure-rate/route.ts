import { NextResponse } from 'next/server';
import { fetchIssues, fetchDeployments } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Issue = components["schemas"]["issue"];
type Deployment = components["schemas"]["deployment"];

function calculateFailureRate(deployments: Deployment[], issues: Issue[]): number {
    if (deployments.length === 0) return 0;

    let failureCount = 0;
    for (const deployment of deployments) {
        const deploymentTime = new Date(deployment.created_at).getTime();
        const hasMatchingIssue = issues.some(issue => {
            const issueTime = new Date(issue.created_at).getTime();
            // A failure is a bug reported within 24 hours of a deployment
            return Math.abs(issueTime - deploymentTime) < 24 * 60 * 60 * 1000; 
        });
        if (hasMatchingIssue) {
            failureCount++;
        }
    }
    return (failureCount / deployments.length) * 100;
}

export async function GET() {
  try {
    const [allDeployments, allIssues]: [Deployment[], Issue[]] = await Promise.all([
        fetchDeployments(100),
        fetchIssues('closed', 'bug', 100)
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

    const recentDeployments = allDeployments.filter(
        d => new Date(d.created_at) > thirtyDaysAgo
    );
    const previousDeployments = allDeployments.filter(
        d => new Date(d.created_at) <= thirtyDaysAgo && new Date(d.created_at) > sixtyDaysAgo
    );

    const recentIssues = allIssues.filter(
        i => new Date(i.created_at) > thirtyDaysAgo
    );
    const previousIssues = allIssues.filter(
        i => new Date(i.created_at) <= thirtyDaysAgo && new Date(i.created_at) > sixtyDaysAgo
    );

    const failureRateRecent = calculateFailureRate(recentDeployments, recentIssues);
    const failureRatePrevious = calculateFailureRate(previousDeployments, previousIssues);

    const change = failureRatePrevious > 0 
        ? ((failureRateRecent - failureRatePrevious) / failureRatePrevious) * 100 
        : failureRateRecent > 0 ? 100 : 0;

    return NextResponse.json({ 
        rate: failureRateRecent,
        change: change
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 