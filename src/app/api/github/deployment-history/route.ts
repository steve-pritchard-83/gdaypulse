import { NextResponse } from 'next/server';
import { fetchDeployments } from '@/lib/github';

interface DeploymentInfo {
  id: number;
  sha: string;
  environment: string;
  date: string;
  creator: string;
}

interface RawDeployment {
    id: number;
    sha: string;
    environment: string;
    created_at: string;
    creator: {
        login: string;
    };
}

export async function GET() {
  try {
    const rawDeployments: RawDeployment[] = await fetchDeployments(5); // Get last 5 deployments
    const deployments: DeploymentInfo[] = rawDeployments.map((d) => ({
      id: d.id,
      sha: d.sha.substring(0, 7),
      environment: d.environment,
      date: d.created_at,
      creator: d.creator.login,
    }));

    return NextResponse.json({ deployments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 