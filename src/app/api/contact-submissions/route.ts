import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    const now = new Date();
    
    // Current month's submission count
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfCurrentMonth = now.getTime();
    const current = await kv.zcount('submissions_log', startOfCurrentMonth, endOfCurrentMonth);

    // Previous month's submission count
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
    const previousMonthSubmissions = await kv.zcount('submissions_log', startOfPreviousMonth, endOfPreviousMonth);
    
    // Set baseline as per user request
    const baseline = previousMonthSubmissions > 0 ? previousMonthSubmissions : 10;
    
    // Calculate target
    const target = Math.ceil(baseline * 1.1);
    
    // Get all submissions from the last 30 days for the chart
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).getTime();
    const allSubmissions: string[] = await kv.zrange('submissions_log', thirtyDaysAgo, endOfCurrentMonth, { byScore: true });
    
    // Group submissions by day
    const submissionsByDay = allSubmissions.reduce((acc: Record<string, number>, member) => {
        const timestamp = parseInt(member.split(':')[1]);
        const date = new Date(timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Format for chart
    const chartData = Object.keys(submissionsByDay).map(date => ({
        date,
        count: submissionsByDay[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
        okr: {
            baseline,
            current,
            target,
            progress: target > 0 ? (current / target) * 100 : 0,
            chartData: chartData,
        }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const timestamp = Date.now();
    const member = `sub:${timestamp}:${Math.random().toString(36).substring(2, 9)}`;
    
    await kv.zadd('submissions_log', { score: timestamp, member });

    return NextResponse.json({ message: 'Submission recorded' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}