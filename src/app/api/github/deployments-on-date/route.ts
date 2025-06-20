import { NextResponse } from 'next/server';
import { fetchDeployments } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Deployment = components["schemas"]["deployment"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ message: 'Date parameter is required' }, { status: 400 });
    }

    const allDeployments: Deployment[] = await fetchDeployments(100);
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const deploymentsOnDate = allDeployments.filter(d => {
        if (!d.created_at) return false;
        const deploymentDate = new Date(d.created_at);
        return deploymentDate >= startOfDay && deploymentDate <= endOfDay;
    });

    return NextResponse.json(deploymentsOnDate);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 