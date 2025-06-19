import { NextResponse } from 'next/server';
import { fetchDeployments } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Deployment = components["schemas"]["deployment"];

export async function GET() {
  try {
    const rawDeployments: Deployment[] = await fetchDeployments(5); // Get last 5 deployments
    const deployments = rawDeployments.map((d) => ({
      id: d.id,
      sha: d.sha.substring(0, 7),
      environment: d.environment,
      date: d.created_at,
      creator: d.creator?.login || 'unknown',
    }));

    return NextResponse.json({ deployments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 