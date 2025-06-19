'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface DeploymentsChartProps {
  data: { date: string; count: number }[];
}

const DeploymentsChart = ({ data }: DeploymentsChartProps) => {
  return (
    <div>
      <h2 style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        margin: '0 0 1rem 0',
        color: '#a0a0a0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>Deployments Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
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
          />
          <Line type="monotone" dataKey="count" name="Deployments" stroke="var(--gday-yellow)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeploymentsChart; 