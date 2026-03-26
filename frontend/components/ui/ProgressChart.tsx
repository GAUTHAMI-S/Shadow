'use client';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ChartPoint } from '@/lib/types';

interface ProgressChartProps {
  data: ChartPoint[];
  type?: 'bar' | 'line';
  color?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gd-surface2 border border-gd-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-gd-muted mb-1">{label}</p>
      <p className="text-gd-text font-semibold">{payload[0].value}% complete</p>
    </div>
  );
};

export default function ProgressChart({
  data,
  type = 'bar',
  color = '#3fb950',
  height = 180,
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gd-muted text-sm" style={{ height }}>
        No data yet
      </div>
    );
  }

  const commonAxisProps = {
    tick: { fill: '#7d8590', fontSize: 11 },
    axisLine: false,
    tickLine: false,
  };

  const gridProps = {
    stroke: 'rgba(255,255,255,0.05)',
    strokeDasharray: '3 3',
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} {...gridProps} />
          <XAxis dataKey="label" {...commonAxisProps} />
          <YAxis domain={[0, 100]} {...commonAxisProps} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine y={80} stroke="rgba(63,185,80,0.2)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barCategoryGap="35%">
        <CartesianGrid vertical={false} {...gridProps} />
        <XAxis dataKey="label" {...commonAxisProps} />
        <YAxis domain={[0, 100]} {...commonAxisProps} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="percentage" fill={color} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
