'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface OKRChartProps {
    data: {
        baseline: number;
        target: number;
        current: number;
    }
}

const OKRChart = ({ data }: OKRChartProps) => {
    const chartData = [
        { name: 'Previous Month', Submissions: data.baseline, fill: '#666666' },
        { name: '+10% Target', Submissions: data.target, fill: '#999999' },
        { name: 'Current Month', Submissions: data.current, fill: 'var(--gday-yellow)' },
    ];

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis type="number" stroke="#a0a0a0" allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#a0a0a0" width={110} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--gday-charcoal)',
                        borderColor: '#555',
                        color: 'var(--gday-white)'
                    }}
                    labelStyle={{ color: 'var(--gday-white)', fontWeight: 'bold' }}
                    cursor={{fill: '#ffffff1a'}}
                />
                <Bar dataKey="Submissions" barSize={30} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default OKRChart; 