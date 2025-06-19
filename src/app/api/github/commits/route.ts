import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Commit = components["schemas"]["commit"];

export async function GET() {
  try {
    const rawCommits: Commit[] = await fetchCommits(5); // Get last 5 commits
    const commits = rawCommits.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name || 'unknown',
      date: c.commit.author?.date || new Date().toISOString(),
    }));
    return NextResponse.json({ commits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 