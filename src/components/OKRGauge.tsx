'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import styles from './OKRGauge.module.css';

interface OKRGaugeProps {
  value: number;
}

const OKRGauge = ({ value }: OKRGaugeProps) => {
  const roundedValue = Math.round(value);
  const data = [{ name: 'OKR', value: roundedValue }];

  return (
    <div className={styles.gauge_container}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#444' }}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={10}
            fill="var(--gday-yellow)"
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={styles.gauge_label}>
            {`${roundedValue}%`}
          </text>
           <text x="50%" y="50%" dy="2.2em" textAnchor="middle" className={styles.gauge_sublabel}>
            To Goal
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OKRGauge; 