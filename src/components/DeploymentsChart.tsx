'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './DeploymentsChart.module.css';

type Props = {
  data: { date: string; count: number }[];
};

export default function DeploymentsChart({ data }: Props) {
  return (
    <div className={styles.chart_container}>
      <h3>Deployments Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
          <XAxis dataKey="date" tick={{ fill: '#f1f1f1' }} stroke="rgba(255, 255, 255, 0.3)" />
          <YAxis tick={{ fill: '#f1f1f1' }} stroke="rgba(255, 255, 255, 0.3)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(20, 20, 20, 0.8)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#f1f1f1'
            }}
            labelStyle={{ color: '#f1f1f1' }}
          />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4, fill: '#8884d8' }} activeDot={{ r: 8 }}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 