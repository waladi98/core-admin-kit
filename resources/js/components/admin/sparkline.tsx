import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

export interface SparklineProps {
    data: number[];
    tone?: 'success' | 'danger';
    className?: string;
}

const toneColors = {
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
} as const;

export function Sparkline({ data, tone = 'success', className }: SparklineProps) {
    const gradientId = `sparkline-${useId().replace(/:/g, '')}`;
    const color = toneColors[tone];
    const points = data.map((value, index) => ({ index, value }));

    return (
        <div className={className} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Area
                        type="linear"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false}
                        dot={false}
                        activeDot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
