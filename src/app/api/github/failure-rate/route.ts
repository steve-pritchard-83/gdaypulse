import { NextResponse } from 'next/server';
import { fetchPullRequests } from '@/lib/github';

interface GitHubLabel {
  name: string;
}

interface GitHubPullRequest {
  labels: GitHubLabel[];
}

export async function GET() {
  try {
    const prs: GitHubPullRequest[] = await fetchPullRequests('closed', 50);

    const bugFixes = prs.filter((pr) =>
      pr.labels?.some((label) =>
        label.name.toLowerCase().includes('bug')
      )
    ).length;

    const total = prs.length;
    const rate = total ? (bugFixes / total) * 100 : 0;

    return NextResponse.json({ rate: rate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 