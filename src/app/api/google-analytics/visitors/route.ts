import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

async function getVisitorCount(propertyId: string): Promise<number> {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: '30daysAgo',
                endDate: 'today',
            },
        ],
        metrics: [
            {
                name: 'totalUsers',
            },
        ],
    });

    const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value ?? '0';
    return parseInt(totalUsers, 10);
}


export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return NextResponse.json({ message: 'Google Analytics Property ID not configured' }, { status: 500 });
  }

  try {
    const visitors = await getVisitorCount(propertyId);
    
    // As per your request, the baseline is 10 and the target is a 10% uplift.
    const baseline = 10;
    const target = 11;
    const progress = (visitors / target) * 100;

    return NextResponse.json({ 
        okr: {
            baseline: baseline,
            target: target,
            current: visitors,
            progress: progress > 100 ? 100 : progress,
            // We don't have historical data for a chart yet
            chartData: [] 
        }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(error);
    return NextResponse.json({ message }, { status: 500 });
  }
} 