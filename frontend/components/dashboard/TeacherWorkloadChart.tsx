'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface TeacherWorkloadChartProps {
    data: { name: string; activeGroups: number }[];
    onClose?: () => void;
}

export default function TeacherWorkloadChart({ data, onClose }: TeacherWorkloadChartProps) {
    return (
        <ChartWrapper title="Teacher Workload (Active Groups)" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                        dataKey="activeGroups"
                        fill="#8B5CF6"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
