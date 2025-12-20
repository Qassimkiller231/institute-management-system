'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartWrapper from './ChartWrapper';

interface StudentDistributionChartProps {
    data: { name: string; count: number }[];
    onClose?: () => void;
}

const COLORS = [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B'  // Amber
];

export default function StudentDistributionChart({ data, onClose }: StudentDistributionChartProps) {
    return (
        <ChartWrapper title="Students by Program" onClose={onClose}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="name"
                        label={(props: any) => (props.percent || 0) > 0.05 ? `${((props.percent || 0) * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                        animationDuration={1500}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '12px', right: -10 }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
