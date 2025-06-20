'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import styles from './TimeSeriesChart.module.css'; // Reusing styles

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p>{data.name}</p>
          {data.value && <p><strong>Lines:</strong> {data.value}</p>}
          {data.author && <p><strong>Author:</strong> {data.author}</p>}
        </div>
      );
    }
    return null;
};

const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, name, author, color } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 && (
                 <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
                    {name}
                </text>
            )}
            {depth > 1 && width > 80 && height > 20 ? (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
                    {name.split('/').pop()}
                </text>
            ) : null}
        </g>
    );
};
  

export default function CodeOwnershipChart() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/github/code-ownership');
                if (!res.ok) {
                    throw new Error('Failed to fetch code ownership data');
                }
                const ownershipData = await res.json();
                
                // Assign colors to authors
                const authorColorMap = new Map<string, string>();
                let colorIndex = 0;
                ownershipData.children.forEach((authorNode: any) => {
                    if (!authorColorMap.has(authorNode.name)) {
                        authorColorMap.set(authorNode.name, COLORS[colorIndex % COLORS.length]);
                        colorIndex++;
                    }
                    // Assign color to author and all their file nodes
                    authorNode.color = authorColorMap.get(authorNode.name);
                    authorNode.children.forEach((fileNode: any) => {
                        fileNode.color = authorNode.color;
                    });
                });

                setData(ownershipData);
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading Code Ownership...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || !data.children || data.children.length === 0) return <div>No code ownership data available.</div>;

    return (
        <div className={styles.chartContainer} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className={styles.chartTitle}>Code Ownership</h3>
            <ResponsiveContainer width="100%" height={500}>
                <Treemap
                    data={[data]}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    isAnimationActive={false}
                    content={<CustomizedContent />}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
} 