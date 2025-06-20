import { NextResponse } from 'next/server';
import { fetchCommits, fetchDeployments } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Commit = components["schemas"]["commit"];
type Deployment = components["schemas"]["deployment"];

export async function GET() {
  try {
    const [commits, deployments]: [Commit[], Deployment[]] = await Promise.all([
        fetchCommits(100),
        fetchDeployments(100)
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const commitsThisWeek = commits.filter(
      (c) => c.commit.author && new Date(c.commit.author.date as string) > oneWeekAgo
    ).length;

    const deploymentsThisWeek = deployments.filter(
        (d) => d.created_at && new Date(d.created_at) > oneWeekAgo
    ).length;
    
    return NextResponse.json({ 
        weeklyCommitCount: commitsThisWeek,
        weeklyDeploymentCount: deploymentsThisWeek 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 