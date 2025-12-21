'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface RevenueChartProps {
    data: { month: string; collected: number; expected: number }[];
    onClose?: () => void;
}

export default function RevenueChart({ data, onClose }: RevenueChartProps) {
    return (
        <ChartWrapper title="Revenue Overview (Collected vs Expected)" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#374151' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#374151' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `BD ${value}`}
                    />
                    <Tooltip
                        formatter={(value) => [`BD ${value}`, undefined]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#F3F4F6' }}
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '10px' }}
                        formatter={(value) => <span style={{ color: '#374151', fontWeight: 500 }}>{value}</span>}
                    />
                    <Bar
                        dataKey="collected"
                        name="Collected"
                        fill="url(#colorRevenue)"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                        animationDuration={1500}
                    />
                    <Bar
                        dataKey="expected"
                        name="Expected"
                        fill="url(#colorExpected)"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
