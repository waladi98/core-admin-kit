import { formatNumber } from '@/lib/format';
import { type TrendPoint } from '@/types/dashboard';
import { useState } from 'react';
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TrendChartProps {
    points: TrendPoint[];
    /** Bar highlighted before the user hovers. Defaults to the highest value. */
    highlightIndex?: number;
    className?: string;
}

function findHighestIndex(points: TrendPoint[]): number {
    return points.reduce((highestIndex, point, index) => (point.value > points[highestIndex].value ? index : highestIndex), 0);
}

export function TrendChart({ points, highlightIndex, className }: TrendChartProps) {
    const defaultIndex = highlightIndex ?? findHighestIndex(points);
    const [activeIndex, setActiveIndex] = useState(defaultIndex);
    const activePoint = points[activeIndex];

    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={points}
                    margin={{ top: 16, right: 0, bottom: 0, left: 0 }}
                    barCategoryGap="18%"
                    onMouseMove={(state) => {
                        if (state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                            setActiveIndex(Number(state.activeTooltipIndex));
                        }
                    }}
                >
                    <defs>
                        <linearGradient id="trend-bar-idle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-chart-idle)" />
                            <stop offset="100%" stopColor="var(--color-chart-idle-end)" />
                        </linearGradient>
                        <linearGradient id="trend-bar-active" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-chart-active)" />
                            <stop offset="100%" stopColor="var(--color-chart-active-end)" />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} dy={8} />
                    <YAxis
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        width={44}
                        tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }}
                        tickFormatter={(value: number) => formatNumber(value)}
                    />
                    <Tooltip
                        defaultIndex={defaultIndex}
                        cursor={false}
                        isAnimationActive={false}
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) {
                                return null;
                            }

                            return (
                                <span className="bg-brand text-brand-foreground shadow-pop rounded-md px-2 py-1 text-xs font-medium">
                                    {label} : {formatNumber(Number(payload[0].value))}
                                </span>
                            );
                        }}
                    />
                    {activePoint && <ReferenceLine y={activePoint.value} stroke="var(--color-ink)" strokeDasharray="4 4" strokeOpacity={0.6} />}
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72} isAnimationActive={false}>
                        {points.map((point, index) => (
                            <Cell key={point.label} fill={index === activeIndex ? 'url(#trend-bar-active)' : 'url(#trend-bar-idle)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
