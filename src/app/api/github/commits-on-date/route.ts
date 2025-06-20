import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Commit = components["schemas"]["commit"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ message: 'Date parameter is required' }, { status: 400 });
    }

    const allCommits: Commit[] = await fetchCommits(100);
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const commitsOnDate = allCommits.filter(c => {
        if (!c.commit.author?.date) return false;
        const commitDate = new Date(c.commit.author.date);
        return commitDate >= startOfDay && commitDate <= endOfDay;
    });

    return NextResponse.json(commitsOnDate);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 