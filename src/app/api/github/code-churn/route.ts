import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This is a simplified proxy for churn. A real implementation would be much more complex.
    // For now, we are returning mocked data.
    
    const totalAdditions = 5000;
    const totalDeletions = 1500;

    const churnRate = totalAdditions > 0 ? (totalDeletions / totalAdditions) * 100 : 0;

    return NextResponse.json({ rate: churnRate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
} 