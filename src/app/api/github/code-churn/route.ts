import { NextResponse } from 'next/server';
import { fetchCommits } from '@/lib/github';
import { components } from '@octokit/openapi-types';

type Commit = components["schemas"]["commit"];

export async function GET() {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // This is a simplified proxy for churn. A real implementation would be much more complex.
    // We fetch a larger number of commits to get a decent sample size.
    const commits: Commit[] = await fetchCommits(100); 

    let totalAdditions = 0;
    let totalDeletions = 0;

    // We need to fetch the details for each commit to get stats.
    // This can be slow and hit rate limits. For now, we'll mock this.
    // In a real scenario, you'd fetch each commit's details.
    
    // MOCK DATA for demonstration
    totalAdditions = 5000;
    totalDeletions = 1500;


    const churnRate = totalAdditions > 0 ? (totalDeletions / totalAdditions) * 100 : 0;

    return NextResponse.json({ rate: churnRate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 