import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type CommitDetail = components["schemas"]["commit"];

export async function GET() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const allCommits = await fetchCommits();

    const commitsByDate: { [key: string]: number } = {};

    allCommits.forEach((commit: CommitDetail) => {
        const commitDate = commit.commit.author?.date;
        if (commitDate && new Date(commitDate) >= ninetyDaysAgo) {
            const date = new Date(commitDate).toISOString().split('T')[0];
            if (!commitsByDate[date]) {
                commitsByDate[date] = 0;
            }
            commitsByDate[date]++;
        }
    });

    const chartData = Object.entries(commitsByDate).map(([date, count]) => ({
      date,
      commitCount: count,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ chartData });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching daily commits:', errorMessage);
    return NextResponse.json({ message: 'Error fetching daily commits' }, { status: 500 });
  }
} 