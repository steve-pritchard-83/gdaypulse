'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SubmissionsChartProps {
  data: { date: string; count: number }[];
}

const SubmissionsChart = ({ data }: SubmissionsChartProps) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            margin: '0 0 1rem 0',
            color: '#a0a0a0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>Form Submissions Over Time</h2>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.6} />
            <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} />
            <YAxis stroke="#a0a0a0" fontSize={12} allowDecimals={false} />
            <Tooltip
                contentStyle={{
                backgroundColor: 'var(--gday-charcoal)',
                borderColor: '#555',
                color: 'var(--gday-white)'
                }}
                labelStyle={{ color: 'var(--gday-white)', fontWeight: 'bold' }}
                cursor={{fill: '#ffffff1a'}}
            />
            <Line type="monotone" dataKey="count" name="Submissions" stroke="var(--gday-yellow)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SubmissionsChart; 