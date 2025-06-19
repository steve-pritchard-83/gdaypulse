import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface RawCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export async function GET() {
  try {
    const rawCommits: RawCommit[] = await fetchCommits(5); // Get last 5 commits
    const commits: CommitInfo[] = rawCommits.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
    }));
    return NextResponse.json({ commits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 