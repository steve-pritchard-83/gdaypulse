import { NextResponse } from 'next/server';
import { fetchDeployments } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Deployment = components["schemas"]["deployment"];

export async function GET() {
  try {
    const deployments: Deployment[] = await fetchDeployments();

    // Group deployments by day
    const groups = deployments.reduce((acc: Record<string, number>, deployment) => {
      if (deployment.created_at) {
        const date = deployment.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    // Format for chart
    const dailyCounts = Object.keys(groups)
      .map((date) => ({
        date,
        count: groups[date],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ chartData: dailyCounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 