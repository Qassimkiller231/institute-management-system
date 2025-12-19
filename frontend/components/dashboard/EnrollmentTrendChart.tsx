'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface EnrollmentTrendChartProps {
    data: { month: string; enrolled: number; withdrew: number; net: number }[];
    onClose?: () => void;
}

export default function EnrollmentTrendChart({ data, onClose }: EnrollmentTrendChartProps) {
    return (
        <ChartWrapper title="Enrollment Growth Trend" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="enrolled"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        animationDuration={2000}
                    />
                    <Line
                        type="monotone"
                        dataKey="withdrew"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
