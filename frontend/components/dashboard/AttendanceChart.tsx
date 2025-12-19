'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface AttendanceChartProps {
    data: { month: string; averageAttendance: number }[];
    onClose?: () => void;
}

export default function AttendanceChart({ data, onClose }: AttendanceChartProps) {
    return (
        <ChartWrapper title="Average Attendance Trend" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#8B5CF6', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="averageAttendance"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAttendance)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
