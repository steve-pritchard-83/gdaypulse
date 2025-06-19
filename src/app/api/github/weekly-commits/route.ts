import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';

interface Commit {
  commit: {
    author: {
      date: string;
    };
  };
}

export async function GET() {
  try {
    const commits: Commit[] = await fetchCommits(100); // Fetch last 100 commits for an accurate weekly count

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const commitsThisWeek = commits.filter(
      (c) => new Date(c.commit.author.date) > oneWeekAgo
    ).length;
    
    return NextResponse.json({ weeklyCommitCount: commitsThisWeek });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 