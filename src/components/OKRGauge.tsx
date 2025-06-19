'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './OKRGauge.module.css';

type Props = {
  progress: number;
};

export default function OKRGauge({ progress }: Props) {
  const chartData = [{ name: 'Progress', value: progress, fill: '#82ca9d' }];

  return (
    <div className={styles.gauge_wrapper}>
      <h3>OKR Progress</h3>
      <div className={styles.gauge_container}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            barSize={15}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255, 255, 255, 0.1)' }} dataKey="value" cornerRadius={10} angleAxisId={0} />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className={styles.gauge_label}>
          {progress.toFixed(1)}%
        </p>
      </div>
    </div>
  );
} 