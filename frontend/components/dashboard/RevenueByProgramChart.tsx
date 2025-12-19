'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface RevenueByProgramChartProps {
    data: { name: string; value: number }[];
    onClose?: () => void;
}

export default function RevenueByProgramChart({ data, onClose }: RevenueByProgramChartProps) {
    return (
        <ChartWrapper title="Total Revenue by Program" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorProgram" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        interval={0}
                    />
                    <Tooltip
                        formatter={(value) => `BD ${Number(value).toFixed(2)}`}
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                        dataKey="value"
                        fill="url(#colorProgram)"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
