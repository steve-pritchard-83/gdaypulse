'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { TooltipProps } from 'recharts';
import styles from './TimeSeriesChart.module.css';

interface DataPoint {
  date: string;
  [key: string]: any;
}

interface Series {
  name: string;
  dataKey: string;
  color: string;
  data: DataPoint[];
}

interface TimeSeriesChartProps {
  title: string;
  series: Series[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((pld) => (
            <div key={pld.dataKey} style={{ color: pld.color }}>
              <strong>{pld.name}:</strong> {pld.value}
            </div>
          ))}
        </div>
      );
    }
  
    return null;
  };

const TimeSeriesChart = ({ title, series }: TimeSeriesChartProps) => {
  const mergedData = new Map<string, DataPoint>();

  series.forEach((s) => {
    s.data.forEach((d) => {
      if (!mergedData.has(d.date)) {
        mergedData.set(d.date, { date: d.date });
      }
      const entry = mergedData.get(d.date);
      if(entry) {
        entry[s.dataKey] = d.count;
      }
    });
  });

  const chartData = Array.from(mergedData.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className={styles.chartContainer} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
            <defs>
                {series.map((s) => (
                    <linearGradient key={s.name} id={`color${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                    </linearGradient>
                ))}
            </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {series.map((s) => (
            <Area
                key={s.name}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color${s.dataKey})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart; 