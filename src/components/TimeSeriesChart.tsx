'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
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
import Modal from './Modal/Modal';
import DailyDetails from './DailyDetails';

interface DataPoint {
  date: string;
  commitCount?: number;
  deploymentCount?: number;
  [key: string]: string | number | undefined;
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

interface ModalInfo {
    date: string;
    type: 'commits' | 'deployments';
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
  const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const mergedData = new Map<string, DataPoint>();
  series.forEach(s => {
    s.data.forEach(d => {
      const entry = mergedData.get(d.date) || { date: d.date };
      mergedData.set(d.date, { ...entry, ...d });
    });
  });

  const chartData = Array.from(mergedData.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleChartClick = (e: { activeLabel?: string; activePayload?: { dataKey: string }[] } | null) => {
    if (e && e.activePayload && e.activePayload.length > 0 && e.activeLabel) {
        const date = e.activeLabel;
        const clickedKey = e.activePayload[0].dataKey;
        const type = clickedKey === 'commitCount' ? 'commits' : 'deployments';
        setModalInfo({ date, type });
    }
  };

  return (
    <>
        <div className={styles.chartContainer} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
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
                    activeDot={{ r: 6, strokeWidth: 2, fill: s.color, stroke: '#1a1a1a' }}
                />
            ))}
            </AreaChart>
        </ResponsiveContainer>
        </div>
        {hasMounted && modalInfo && (
            <Modal isOpen={!!modalInfo} onClose={() => setModalInfo(null)}>
                <DailyDetails date={modalInfo.date} type={modalInfo.type} />
            </Modal>
        )}
    </>
  );
};

export default TimeSeriesChart; 